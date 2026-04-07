import { Injectable, InjectionToken, inject } from '@angular/core';
import { AlarmEvent } from '../models/alarm-event.model';
import { AlarmPriority } from '../models/alarm-priority.enum';
import { PushEvent } from '../models/push-event.model';
import { PushEventType } from '../models/push-event-type.enum';
import { NotificationEvent } from '../../../features/notification/models/notification-event.model';
import { BackendResolvedPayload, BackendTriggeredPayload } from '../models/realtime-alarm-event.model';

export interface RealtimeAlarmEventNormalizerPort {
	tryParseEnvelope(raw: unknown): PushEvent | null;
	parseAlarmEvent(payload: unknown): AlarmEvent | null;
	parseNotificationEvent(payload: unknown): NotificationEvent | null;
	extractAlarmId(payload: unknown): string | null;
	parseBackendTriggeredPayload(payload: unknown): BackendTriggeredPayload | null;
	parseBackendResolvedPayload(payload: unknown): BackendResolvedPayload | null;
}

export const REALTIME_ALARM_EVENT_NORMALIZER = new InjectionToken<RealtimeAlarmEventNormalizerPort>(
	'REALTIME_ALARM_EVENT_NORMALIZER',
	{
		providedIn: 'root',
		factory: () => inject(RealtimeAlarmEventNormalizerService),
	}
);

@Injectable({ providedIn: 'root' })
export class RealtimeAlarmEventNormalizerService implements RealtimeAlarmEventNormalizerPort {
	public tryParseEnvelope(raw: unknown): PushEvent | null {
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

	public parseAlarmEvent(payload: unknown): AlarmEvent | null {
		if (!this.isObject(payload)) {
			return null;
		}

		const id = payload['id'];
		const alarmRuleId = payload['alarmRuleId'];
		const alarmName = payload['alarmName'];
		const priority = payload['priority'];
		const activationTime = payload['activationTime'];
		const resolutionTime = payload['resolutionTime'];

		if (
			typeof id !== 'string' ||
			typeof alarmRuleId !== 'string' ||
			typeof alarmName !== 'string' ||
			!this.isAlarmPriority(priority) ||
			typeof activationTime !== 'string' ||
			!(typeof resolutionTime === 'string' || resolutionTime === null)
		) {
			return null;
		}

		return {
			id,
			alarmRuleId,
			alarmName,
			priority,
			activationTime,
			resolutionTime,
		};
	}

	public parseNotificationEvent(payload: unknown): NotificationEvent | null {
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

	public extractAlarmId(payload: unknown): string | null {
		if (!this.isObject(payload)) {
			return null;
		}

		const id = payload['id'];
		if (typeof id === 'string') {
			return id;
		}

		const alarmEventId = payload['alarmEventId'];
		return typeof alarmEventId === 'string' ? alarmEventId : null;
	}

	public parseBackendTriggeredPayload(payload: unknown): BackendTriggeredPayload | null {
		if (!this.isObject(payload)) {
			return null;
		}

		const alarmEventId = payload['alarmEventId'];
		const wardId = payload['wardId'];
		const alarmRuleId = payload['alarmRuleId'];

		if (
			typeof alarmEventId !== 'string' ||
			typeof wardId !== 'number' ||
			typeof alarmRuleId !== 'string'
		) {
			return null;
		}

		return {
			alarmEventId,
			wardId,
			alarmRuleId,
		};
	}

	public parseBackendResolvedPayload(payload: unknown): BackendResolvedPayload | null {
		if (!this.isObject(payload)) {
			return null;
		}

		const alarmEventId = payload['alarmEventId'];
		const wardId = payload['wardId'];

		if (typeof alarmEventId !== 'string') {
			return null;
		}

		return {
			alarmEventId,
			wardId: typeof wardId === 'number' ? wardId : undefined,
		};
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
