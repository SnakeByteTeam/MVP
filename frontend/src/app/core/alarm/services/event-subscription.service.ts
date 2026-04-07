import { Injectable, InjectionToken, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, fromEvent, takeUntil } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AlarmPriority } from '../models/alarm-priority.enum';
import { ConnectionStatus } from '../models/connection-status.enum';
import { PushEvent } from '../models/push-event.model';
import { PushEventType } from '../models/push-event-type.enum';
import { AlarmStateService } from './alarm-state.service';
import { API_BASE_URL } from '../../tokens/api-base-url.token';
import { InternalAuthService } from '../../services/internal-auth.service';
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

	public initialize(wardIds: string[]): void {
		this.connect();
		this.ensureAuthLifecycleSubscription();

		for (const wardId of wardIds) {
			this.joinRoom(wardId);
		}
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
				if (this.handleEnvelopeRawEvent(rawEvent)) {
					return;
				}

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
					this.emitLeaveMany(this.roomCoordinator.deactivateUser());
					return;
				}

				const actions = this.roomCoordinator.activateUser(session.userId);
				this.emitLeaveMany(actions.roomsToLeave);
				this.emitJoinMany(actions.roomsToJoin);
			});
	}

	private handleEnvelopeRawEvent(raw: unknown): boolean {
		const parsedEvent = this.eventNormalizer.tryParseEnvelope(raw);
		if (!parsedEvent) {
			return false;
		}

		switch (parsedEvent.eventType) {
			case PushEventType.ALARM_TRIGGERED: {
				const alarmEvent = this.eventNormalizer.parseAlarmEvent(parsedEvent.payload);
				if (alarmEvent) {
					this.alarmStateService.onAlarmTriggered(alarmEvent);
					this.lifecycleNotifier.publish('triggered', alarmEvent.id, parsedEvent.timestamp);
				}

				return true;
			}
			case PushEventType.ALARM_RESOLVED: {
				const alarmId = this.eventNormalizer.extractAlarmId(parsedEvent.payload);
				if (alarmId) {
					this.alarmStateService.onAlarmResolved(alarmId);
					this.lifecycleNotifier.publish('resolved', alarmId, parsedEvent.timestamp);
				}

				return true;
			}
			case PushEventType.NOTIFICATION:
				this.dispatchNotificationEvent(parsedEvent);
				return true;
			default:
				return true;
		}
	}

	private handleBackendTriggeredRawEvent(raw: unknown): void {
		const payload = this.eventNormalizer.parseBackendTriggeredPayload(raw);
		if (!payload) {
			return;
		}

		this.joinRoom(String(payload.wardId));

		const timestamp = new Date().toISOString();
		this.alarmStateService.onAlarmTriggered({
			id: payload.alarmEventId,
			alarmRuleId: payload.alarmRuleId,
			alarmName: 'Allarme in corso',
			priority: AlarmPriority.ORANGE,
			activationTime: timestamp,
			resolutionTime: null,
		});

		this.lifecycleNotifier.publish('triggered', payload.alarmEventId, timestamp);
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

	private dispatchNotificationEvent(event: PushEvent): void {
		const notificationEvent = this.eventNormalizer.parseNotificationEvent(event.payload);
		if (!notificationEvent) {
			return;
		}

		this.alarmStateService.onNotificationReceived(notificationEvent);
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
			return normalizedApiBaseUrl;
		}

		return globalThis.location.origin;
	}

}
