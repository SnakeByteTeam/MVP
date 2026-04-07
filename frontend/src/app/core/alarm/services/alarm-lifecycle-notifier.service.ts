import { Injectable, InjectionToken, inject } from '@angular/core';
import { AlarmStateService } from './alarm-state.service';
import {
	AlarmLifecycleType,
	AlarmLifecycleUpdateDetail,
	ALARM_LIFECYCLE_UPDATED_EVENT,
} from '../models/realtime-alarm-event.model';

export interface AlarmLifecycleNotifierPort {
	publish(type: AlarmLifecycleType, alarmEventId: string, timestamp: string): void;
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

	public publish(type: AlarmLifecycleType, alarmEventId: string, timestamp: string): void {
		this.publishNotification(type, alarmEventId, timestamp);
		this.publishLifecycleUpdate(type, alarmEventId);
	}

	private publishNotification(type: AlarmLifecycleType, alarmEventId: string, timestamp: string): void {
		const title = type === 'triggered' ? "C'e un allarme in corso" : 'Allarme risolto';

		this.alarmStateService.onNotificationReceived({
			notificationId: `alarm-${type}-${alarmEventId}`,
			title,
			sentAt: timestamp,
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
