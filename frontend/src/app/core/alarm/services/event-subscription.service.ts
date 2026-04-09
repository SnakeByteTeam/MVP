import { Injectable, InjectionToken, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
	BehaviorSubject,
	Observable,
	Subject,
	catchError,
	finalize,
	fromEvent,
	map,
	of,
	takeUntil,
} from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AlarmPriority } from '../models/alarm-priority.enum';
import { ConnectionStatus } from '../models/connection-status.enum';
import { AlarmStateService } from './alarm-state.service';
import { API_BASE_URL } from '../../tokens/api-base-url.token';
import { InternalAuthService } from '../../services/internal-auth.service';
import { AlarmApiService } from './alarm-api.service';
import {
	REALTIME_ALARM_EVENT_NORMALIZER,
	type RealtimeAlarmEventNormalizerPort,
} from './realtime-alarm-event-normalizer.service';
import {
	ALARM_LIFECYCLE_NOTIFIER,
	type AlarmLifecycleNotifierPort,
} from './alarm-lifecycle-notifier.service';
import {
	WARD_SOCKET_ROOM_COORDINATOR,
	type WardSocketRoomCoordinatorPort,
} from './ward-socket-room-coordinator.service';

export const SOCKET_IO_FACTORY = new InjectionToken<typeof io>('SOCKET_IO_FACTORY', {
	providedIn: 'root',
	factory: () => io,
});

@Injectable({ providedIn: 'root' })
export class EventSubscriptionService implements OnDestroy {
	private readonly socketIoFactory = inject(SOCKET_IO_FACTORY);
	private readonly http = inject(HttpClient, { optional: true });
	private readonly alarmApiService = inject(AlarmApiService, { optional: true });
	private readonly alarmStateService = inject(AlarmStateService);
	private readonly apiBaseUrl = inject(API_BASE_URL, { optional: true });
	private readonly internalAuthService = inject(InternalAuthService, { optional: true });
	private readonly eventNormalizer: RealtimeAlarmEventNormalizerPort = inject(REALTIME_ALARM_EVENT_NORMALIZER);
	private readonly lifecycleNotifier: AlarmLifecycleNotifierPort = inject(ALARM_LIFECYCLE_NOTIFIER);
	private readonly roomCoordinator: WardSocketRoomCoordinatorPort = inject(WARD_SOCKET_ROOM_COORDINATOR);

	private readonly connectionStatus$ = new BehaviorSubject<ConnectionStatus>(
		ConnectionStatus.DISCONNECTED
	);
	private readonly destroy$ = new Subject<void>();
	private socket: Socket | null = null;
	private authLifecycleInitialized = false;
	private activeUserId: string | null = null;
	private readonly wardBootstrapInFlightUserIds = new Set<string>();
	private readonly wardBootstrapDoneUserIds = new Set<string>();

	public initialize(wardIds: string[]): void {
		this.connect();
		this.ensureAuthLifecycleSubscription();

		for (const wardId of wardIds) {
			this.joinRoom(wardId);
		}
	}

	public refreshWardRoomSubscription(): void {
		if (!this.activeUserId) {
			return;
		}

		this.bootstrapWardRoomSubscription(this.activeUserId, true);
	}

	public getConnectionStatus$(): Observable<ConnectionStatus> {
		return this.connectionStatus$.asObservable();
	}

	public joinRoom(wardId: string): void {
		const normalizedWardId = this.roomCoordinator.requestJoinRoom(wardId);
		if (!normalizedWardId) {
			return;
		}

		this.socket?.emit('join-ward', normalizedWardId);
	}

	public leaveRoom(wardId: string): void {
		const normalizedWardId = this.roomCoordinator.requestLeaveRoom(wardId);
		if (!normalizedWardId) {
			return;
		}

		this.socket?.emit('leave-ward', normalizedWardId);
	}

	public ngOnDestroy(): void {
		this.disconnect();
	}

	private connect(): void {
		if (this.socket) {
			return;
		}

		this.socket = this.socketIoFactory(this.resolveSocketUrl(), {
			transports: ['websocket'],
			reconnection: true,
			autoConnect: true,
		});

		this.socket
			.on('connect', () => {
				this.connectionStatus$.next(ConnectionStatus.CONNECTED);
				this.rejoinAllRooms();
			})
			.on('disconnect', () => {
				this.connectionStatus$.next(ConnectionStatus.DISCONNECTED);
			})
			.on('reconnect_attempt', () => {
				this.connectionStatus$.next(ConnectionStatus.RECONNECTING);
			});

		fromEvent<unknown>(this.socket, 'push-event')
			.pipe(takeUntil(this.destroy$))
			.subscribe((rawEvent) => {
				this.handleBackendTriggeredRawEvent(rawEvent);
			});

		fromEvent<unknown>(this.socket, 'alarm-resolved')
			.pipe(takeUntil(this.destroy$))
			.subscribe((rawEvent) => {
				this.handleBackendResolvedRawEvent(rawEvent);
			});
	}

	private disconnect(): void {
		if (!this.socket) {
			return;
		}

		this.socket.removeAllListeners();
		this.socket.disconnect();
		this.socket = null;
		this.roomCoordinator.resetRuntimeState();
		this.connectionStatus$.next(ConnectionStatus.DISCONNECTED);

		this.destroy$.next();
		this.destroy$.complete();
	}

	private ensureAuthLifecycleSubscription(): void {
		if (this.authLifecycleInitialized || !this.internalAuthService) {
			return;
		}

		this.authLifecycleInitialized = true;

		this.internalAuthService
			.getCurrentUser$()
			.pipe(takeUntil(this.destroy$))
			.subscribe((session) => {
				if (!session) {
					const previousUserId = this.activeUserId;
					if (previousUserId) {
						this.wardBootstrapInFlightUserIds.delete(previousUserId);
						this.wardBootstrapDoneUserIds.delete(previousUserId);
					}

					this.activeUserId = null;
					this.emitLeaveMany(this.roomCoordinator.deactivateUser());
					return;
				}

				const normalizedUserId = session.userId.trim();
				if (!normalizedUserId) {
					return;
				}

				this.activeUserId = normalizedUserId;

				const actions = this.roomCoordinator.activateUser(normalizedUserId);
				this.emitLeaveMany(actions.roomsToLeave);
				this.emitJoinMany(actions.roomsToJoin);
				if (actions.roomsToJoin.length === 0) {
					this.bootstrapWardRoomSubscription(normalizedUserId);
				}
			});
	}

	private bootstrapWardRoomSubscription(userId: string, forceRefresh = false): void {
		if (!this.http) {
			return;
		}

		if (
			this.wardBootstrapInFlightUserIds.has(userId) ||
			(!forceRefresh && this.wardBootstrapDoneUserIds.has(userId))
		) {
			return;
		}

		this.wardBootstrapInFlightUserIds.add(userId);

		this.http
			.get<unknown>(this.resolvePlantAllEndpoint())
			.pipe(
				map((response) => ({ response, success: true as const })),
				catchError(() => of({ response: null, success: false as const })),
				takeUntil(this.destroy$),
				finalize(() => {
					this.wardBootstrapInFlightUserIds.delete(userId);
					this.wardBootstrapDoneUserIds.add(userId);
				})
			)
			.subscribe((result) => {
				if (!result.success) {
					return;
				}

				const wardIds = this.extractWardIdsFromPlantResponse(result.response);
				if (forceRefresh) {
					this.syncJoinedRoomsWithWardIds(wardIds);
					return;
				}

				for (const wardId of wardIds) {
					this.joinRoom(wardId);
				}
			});
	}

	private syncJoinedRoomsWithWardIds(targetWardIds: ReadonlyArray<string>): void {
		const targetRooms = new Set(targetWardIds);

		for (const joinedWardId of this.roomCoordinator.getJoinedRooms()) {
			if (targetRooms.has(joinedWardId)) {
				continue;
			}

			this.leaveRoom(joinedWardId);
		}

		for (const wardId of targetWardIds) {
			this.joinRoom(wardId);
		}
	}

	private handleBackendTriggeredRawEvent(raw: unknown): void {
		const payload = this.eventNormalizer.parseBackendTriggeredPayload(raw);
		if (!payload) {
			return;
		}

		this.joinRoom(String(payload.wardId));

		this.resolveTriggeredAlarmDetails(payload.alarmEventId)
			.pipe(takeUntil(this.destroy$))
			.subscribe((resolvedDetails) => {
				const timestamp = new Date().toISOString();
				this.alarmStateService.onAlarmTriggered({
					id: payload.alarmEventId,
					alarmRuleId: payload.alarmRuleId,
					alarmName: resolvedDetails.alarmName,
					priority: resolvedDetails.priority,
					activationTime: timestamp,
					resolutionTime: null,
				});

				this.lifecycleNotifier.publish('triggered', payload.alarmEventId, timestamp, {
					alarmName: resolvedDetails.alarmName,
					priority: resolvedDetails.priority,
				});
			});
	}

	private handleBackendResolvedRawEvent(raw: unknown): void {
		const payload = this.eventNormalizer.parseBackendResolvedPayload(raw);
		if (!payload) {
			return;
		}

		if (typeof payload.wardId === 'number') {
			this.joinRoom(String(payload.wardId));
		}

		this.alarmStateService.onAlarmResolved(payload.alarmEventId);
		const timestamp = new Date().toISOString();
		this.lifecycleNotifier.publish('resolved', payload.alarmEventId, timestamp);
	}

	private resolveTriggeredAlarmDetails(
		alarmEventId: string
	): Observable<{ alarmName: string; priority: AlarmPriority }> {
		const fallback = {
			alarmName: 'Allarme in corso',
			priority: AlarmPriority.ORANGE,
		};

		if (!this.alarmApiService) {
			return of(fallback);
		}

		return this.alarmApiService.getAlarmEventById(alarmEventId).pipe(
			map((alarmEvent) => ({
				alarmName:
					typeof alarmEvent.alarmName === 'string' && alarmEvent.alarmName.trim()
						? alarmEvent.alarmName.trim()
						: fallback.alarmName,
				priority: this.normalizeAlarmPriority(alarmEvent.priority) ?? fallback.priority,
			})),
			catchError(() => of(fallback))
		);
	}

	private normalizeAlarmPriority(value: unknown): AlarmPriority | null {
		if (typeof value === 'number' && Number.isInteger(value)) {
			return this.isAlarmPriority(value) ? value : null;
		}

		if (typeof value !== 'string') {
			return null;
		}

		const compact = value.trim().toUpperCase();
		if (!compact) {
			return null;
		}

		if (compact in AlarmPriority) {
			const enumValue = AlarmPriority[compact as keyof typeof AlarmPriority];
			return typeof enumValue === 'number' && this.isAlarmPriority(enumValue)
				? enumValue
				: null;
		}

		const parsed = Number(compact);
		if (Number.isInteger(parsed) && this.isAlarmPriority(parsed)) {
			return parsed;
		}

		return null;
	}

	private isAlarmPriority(value: number): value is AlarmPriority {
		return (
			value === AlarmPriority.WHITE ||
			value === AlarmPriority.GREEN ||
			value === AlarmPriority.ORANGE ||
			value === AlarmPriority.RED
		);
	}

	private rejoinAllRooms(): void {
		for (const wardId of this.roomCoordinator.getJoinedRooms()) {
			this.socket?.emit('join-ward', wardId);
		}
	}

	private emitJoinMany(wardIds: ReadonlyArray<string>): void {
		for (const wardId of wardIds) {
			this.socket?.emit('join-ward', wardId);
		}
	}

	private emitLeaveMany(wardIds: ReadonlyArray<string>): void {
		for (const wardId of wardIds) {
			this.socket?.emit('leave-ward', wardId);
		}
	}

	private resolveSocketUrl(): string {
		const normalizedApiBaseUrl = this.apiBaseUrl?.trim();
		if (normalizedApiBaseUrl) {
			return this.toWebsocketNamespaceUrl(normalizedApiBaseUrl);
		}

		return `${globalThis.location.origin}/ws`;
	}

	private toWebsocketNamespaceUrl(baseUrl: string): string {
		const trimmedBaseUrl = baseUrl.replace(/\/+$/, '');

		if (trimmedBaseUrl.endsWith('/api')) {
			return `${trimmedBaseUrl.slice(0, -4)}/ws`;
		}

		return `${trimmedBaseUrl}/ws`;
	}

	private resolvePlantAllEndpoint(): string {
		const normalizedApiBaseUrl = this.apiBaseUrl?.trim();
		if (normalizedApiBaseUrl) {
			return `${normalizedApiBaseUrl}/plant/all`;
		}

		return '/api/plant/all';
	}

	private extractWardIdsFromPlantResponse(response: unknown): string[] {
		const plants = this.extractPlantArray(response);
		const wardIds = new Set<string>();

		for (const plant of plants) {
			const wardId = this.normalizeWardId(plant.wardId);
			if (!wardId) {
				continue;
			}

			wardIds.add(wardId);
		}

		return Array.from(wardIds.values());
	}

	private extractPlantArray(response: unknown): Array<{ wardId?: unknown }> {
		if (Array.isArray(response)) {
			return response.filter(
				(candidate): candidate is { wardId?: unknown } =>
					typeof candidate === 'object' && candidate !== null
			);
		}

		if (typeof response !== 'object' || response === null) {
			return [];
		}

		const wrapped = response as { data?: unknown; plants?: unknown };
		if (Array.isArray(wrapped.data)) {
			return wrapped.data.filter(
				(candidate): candidate is { wardId?: unknown } =>
					typeof candidate === 'object' && candidate !== null
			);
		}

		if (!Array.isArray(wrapped.plants)) {
			return [];
		}

		return wrapped.plants.filter(
			(candidate): candidate is { wardId?: unknown } =>
				typeof candidate === 'object' && candidate !== null
		);
	}

	private normalizeWardId(rawWardId: unknown): string | null {
		if (typeof rawWardId === 'number' && Number.isInteger(rawWardId)) {
			return String(rawWardId);
		}

		if (typeof rawWardId !== 'string') {
			return null;
		}

		const trimmedWardId = rawWardId.trim();
		if (!trimmedWardId) {
			return null;
		}

		return trimmedWardId;
	}

}
