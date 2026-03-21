import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ActiveAlarm } from '../models/active-alarm.model';
import { AlarmEvent } from '../models/alarm-event.model';
import { NotificationEvent } from '../models/notification-event.model';

@Injectable({ providedIn: 'root' })
export class AlarmStateService {
	private readonly activeAlarms$ = new BehaviorSubject<ActiveAlarm[]>([]);
	private readonly notifications$ = new BehaviorSubject<NotificationEvent[]>([]);

	public onAlarmTriggered(event: AlarmEvent): void {
		const current = this.activeAlarms$.getValue();
		const nextAlarm: ActiveAlarm = {
			id: event.activeAlarmId,
			alarmRuleId: event.alarmRuleId,
			alarmName: event.alarmName,
			priority: event.priority,
			triggeredAt: event.triggeredAt,
		};

		const existingIndex = current.findIndex((alarm) => alarm.id === event.activeAlarmId);
		if (existingIndex >= 0) {
			const updated = [...current];
			updated[existingIndex] = nextAlarm;
			this.activeAlarms$.next(updated);
			return;
		}

		this.activeAlarms$.next([nextAlarm, ...current]);
	}

	public onAlarmResolved(id: string): void {
		const updated = this.activeAlarms$.getValue().filter((alarm) => alarm.id !== id);
		this.activeAlarms$.next(updated);
	}

	public onNotificationReceived(event: NotificationEvent): void {
		this.notifications$.next([event, ...this.notifications$.getValue()]);
	}

	public getActiveAlarms$(): Observable<ActiveAlarm[]> {
		return this.activeAlarms$.asObservable();
	}

	public getActiveAlarmsCount$(): Observable<number> {
		return this.activeAlarms$.pipe(map((alarms) => alarms.length));
	}

	public getNotifications$(): Observable<NotificationEvent[]> {
		return this.notifications$.asObservable();
	}

	public getUnreadNotificationsCount$(): Observable<number> {
		return this.notifications$.pipe(map((notifications) => notifications.length));
	}
}
