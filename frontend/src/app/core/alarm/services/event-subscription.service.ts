import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, fromEvent, takeUntil } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AlarmEvent } from '../models/alarm-event.model';
import { AlarmPriority } from '../models/alarm-priority.enum';
import { ConnectionStatus } from '../models/connection-status.enum';
import { NotificationEvent } from '../models/notification-event.model';
import { PushEvent } from '../models/push-event.model';
import { PushEventType } from '../models/push-event-type.enum';
import { AlarmStateService } from './alarm-state.service';
import { API_BASE_URL } from '../../tokens/api-base-url.token';

@Injectable({ providedIn: 'root' })
export class EventSubscriptionService implements OnDestroy {
	private readonly alarmStateService = inject(AlarmStateService);
	private readonly apiBaseUrl = inject(API_BASE_URL, { optional: true });

	private readonly connectionStatus$ = new BehaviorSubject<ConnectionStatus>(
		ConnectionStatus.DISCONNECTED
	);
	private readonly joinedRooms = new Set<string>();
	private readonly destroy$ = new Subject<void>();
	private socket: Socket | null = null;

	public initialize(wardIds: string[]): void {
		this.connect();

		for (const wardId of wardIds) {
			this.joinRoom(wardId);
		}
	}

	public getConnectionStatus$(): Observable<ConnectionStatus> {
		return this.connectionStatus$.asObservable();
	}

	public joinRoom(wardId: string): void {
		const normalizedWardId = wardId.trim();
		if (!normalizedWardId || this.joinedRooms.has(normalizedWardId)) {
			return;
		}

		this.joinedRooms.add(normalizedWardId);
		this.socket?.emit('join-ward', normalizedWardId);
	}

	public leaveRoom(wardId: string): void {
		const normalizedWardId = wardId.trim();
		if (!normalizedWardId || !this.joinedRooms.has(normalizedWardId)) {
			return;
		}

		this.joinedRooms.delete(normalizedWardId);
		this.socket?.emit('leave-ward', normalizedWardId);
	}

	public ngOnDestroy(): void {
		this.disconnect();
	}

	private connect(): void {
		if (this.socket) {
			return;
		}

		this.socket = io(this.resolveSocketUrl(), {
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
				const parsedEvent = this.parseRawEvent(rawEvent);
				if (!parsedEvent) {
					return;
				}

				switch (parsedEvent.eventType) {
					case PushEventType.ALARM_TRIGGERED:
					case PushEventType.ALARM_RESOLVED:
						this.dispatchAlarmEvent(parsedEvent);
						break;
					case PushEventType.NOTIFICATION:
						this.dispatchNotificationEvent(parsedEvent);
						break;
					default:
						break;
				}
			});
	}

	private disconnect(): void {
		if (!this.socket) {
			return;
		}

		this.socket.removeAllListeners();
		this.socket.disconnect();
		this.socket = null;
		this.joinedRooms.clear();
		this.connectionStatus$.next(ConnectionStatus.DISCONNECTED);

		this.destroy$.next();
		this.destroy$.complete();
	}

	private parseRawEvent(raw: unknown): PushEvent | null {
		if (!this.isObject(raw)) {
			return null;
		}

		const eventType = raw['eventType'];
		const payload = raw['payload'];
		const timestamp = raw['timestamp'];

		if (!this.isPushEventType(eventType) || typeof timestamp !== 'string') {
			return null;
		}

		return {
			eventType,
			payload,
			timestamp,
		};
	}

	private dispatchAlarmEvent(event: PushEvent): void {
		if (event.eventType === PushEventType.ALARM_RESOLVED) {
			const activeAlarmId = this.extractActiveAlarmId(event.payload);
			if (!activeAlarmId) {
				return;
			}

			this.alarmStateService.onAlarmResolved(activeAlarmId);
			return;
		}

		const alarmEvent = this.parseAlarmEvent(event.payload);
		if (!alarmEvent) {
			return;
		}

		this.alarmStateService.onAlarmTriggered(alarmEvent);
	}

	private dispatchNotificationEvent(event: PushEvent): void {
		const notificationEvent = this.parseNotificationEvent(event.payload);
		if (!notificationEvent) {
			return;
		}

		this.alarmStateService.onNotificationReceived(notificationEvent);
	}

	private parseAlarmEvent(payload: unknown): AlarmEvent | null {
		if (!this.isObject(payload)) {
			return null;
		}

		const activeAlarmId = payload['activeAlarmId'];
		const alarmRuleId = payload['alarmRuleId'];
		const alarmName = payload['alarmName'];
		const priority = payload['priority'];
		const triggeredAt = payload['triggeredAt'];
		const resolvedAt = payload['resolvedAt'];
		const userId = payload['user_id'];

		if (
			typeof activeAlarmId !== 'string' ||
			typeof alarmRuleId !== 'string' ||
			typeof alarmName !== 'string' ||
			!this.isAlarmPriority(priority) ||
			typeof triggeredAt !== 'string' ||
			!(typeof resolvedAt === 'string' || resolvedAt === null) ||
			!(typeof userId === 'string' || userId === null)
		) {
			return null;
		}

		return {
			activeAlarmId,
			alarmRuleId,
			alarmName,
			priority,
			triggeredAt,
			resolvedAt,
			user_id: userId,
		};
	}

	private parseNotificationEvent(payload: unknown): NotificationEvent | null {
		if (!this.isObject(payload)) {
			return null;
		}

		const notificationId = payload['notificationId'];
		const title = payload['title'];
		const sentAt = payload['sentAt'];

		if (
			typeof notificationId !== 'string' ||
			typeof title !== 'string' ||
			typeof sentAt !== 'string'
		) {
			return null;
		}

		return {
			notificationId,
			title,
			sentAt,
		};
	}

	private extractActiveAlarmId(payload: unknown): string | null {
		if (!this.isObject(payload)) {
			return null;
		}

		const activeAlarmId = payload['activeAlarmId'];
		return typeof activeAlarmId === 'string' ? activeAlarmId : null;
	}

	private rejoinAllRooms(): void {
		for (const wardId of this.joinedRooms) {
			this.socket?.emit('join-ward', wardId);
		}
	}

	private resolveSocketUrl(): string {
		const normalizedApiBaseUrl = this.apiBaseUrl?.trim();
		if (normalizedApiBaseUrl) {
			return normalizedApiBaseUrl;
		}

		return globalThis.location.origin;
	}

	private isPushEventType(value: unknown): value is PushEventType {
		return typeof value === 'string' && Object.values(PushEventType).includes(value as PushEventType);
	}

	private isAlarmPriority(value: unknown): value is AlarmPriority {
		if (typeof value !== 'number') {
			return false;
		}

		const numericPriorities = Object.values(AlarmPriority).filter(
			(enumValue): enumValue is number => typeof enumValue === 'number'
		);

		return numericPriorities.includes(value);
	}

	private isObject(value: unknown): value is Record<string, unknown> {
		return typeof value === 'object' && value !== null;
	}
}
