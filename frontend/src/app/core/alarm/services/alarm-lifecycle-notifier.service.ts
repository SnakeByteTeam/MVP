import { Injectable, InjectionToken, inject } from '@angular/core';
import { AlarmStateService } from './alarm-state.service';
import {
	AlarmLifecycleType,
	AlarmLifecycleUpdateDetail,
	ALARM_LIFECYCLE_UPDATED_EVENT,
} from '../models/realtime-alarm-event.model';
import {
	DEFAULT_RESOLVED_NOTIFICATION_TITLE,
	DEFAULT_TRIGGERED_NOTIFICATION_TITLE,
	formatTriggeredNotificationTitle,
} from '../../notification/utils/notification-title.util';

export interface AlarmNotificationDetails {
	alarmName?: string;
	priority?: unknown;
}

export interface AlarmLifecycleNotifierPort {
	publish(
		type: AlarmLifecycleType,
		alarmEventId: string,
		timestamp: string,
		details?: AlarmNotificationDetails
	): void;
}

export const ALARM_LIFECYCLE_NOTIFIER = new InjectionToken<AlarmLifecycleNotifierPort>(
	'ALARM_LIFECYCLE_NOTIFIER',
	{
		providedIn: 'root',
		factory: () => inject(AlarmLifecycleNotifierService),
	}
);

@Injectable({ providedIn: 'root' })
export class AlarmLifecycleNotifierService implements AlarmLifecycleNotifierPort {
	private readonly alarmStateService = inject(AlarmStateService);

	public publish(
		type: AlarmLifecycleType,
		alarmEventId: string,
		timestamp: string,
		details?: AlarmNotificationDetails
	): void {
		this.publishNotification(type, alarmEventId, timestamp, details);
		this.publishLifecycleUpdate(type, alarmEventId);
	}

	private publishNotification(
		type: AlarmLifecycleType,
		alarmEventId: string,
		timestamp: string,
		details?: AlarmNotificationDetails
	): void {
		const title =
			type === 'triggered'
				? formatTriggeredNotificationTitle(details?.alarmName, details?.priority) ||
					DEFAULT_TRIGGERED_NOTIFICATION_TITLE
				: DEFAULT_RESOLVED_NOTIFICATION_TITLE;

		this.alarmStateService.onNotificationReceived({
			notificationId: `alarm-${type}-${alarmEventId}`,
			title,
			sentAt: timestamp,
			eventType: type,
		});
	}

	private publishLifecycleUpdate(type: AlarmLifecycleType, alarmEventId: string): void {
		if (typeof globalThis.dispatchEvent !== 'function') {
			return;
		}

		if (typeof CustomEvent === 'function') {
			globalThis.dispatchEvent(
				new CustomEvent<AlarmLifecycleUpdateDetail>(ALARM_LIFECYCLE_UPDATED_EVENT, {
					detail: {
						type,
						alarmEventId,
					},
				})
			);
			return;
		}

		globalThis.dispatchEvent(new Event(ALARM_LIFECYCLE_UPDATED_EVENT));
	}
}
