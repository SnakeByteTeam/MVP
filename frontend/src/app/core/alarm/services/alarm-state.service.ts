import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ActiveAlarm } from '../models/active-alarm.model';
import { AlarmEvent } from '../models/alarm-event.model';
import { NotificationEvent } from '../../../features/notification/models/notification-event.model';

type ActiveAlarmsSnapshotMode = 'merge' | 'replace';

@Injectable({ providedIn: 'root' })
export class AlarmStateService {
	private readonly activeAlarms$ = new BehaviorSubject<ActiveAlarm[]>([]);
	private readonly notifications$ = new BehaviorSubject<NotificationEvent[]>([]);
	private readonly dismissedNotificationIds$ = new BehaviorSubject<ReadonlySet<string>>(new Set());
	private readonly locallyResolvedActiveAlarmIds = new Set<string>();

	public setActiveAlarms(alarms: ActiveAlarm[], mode: ActiveAlarmsSnapshotMode = 'merge'): void {
		const filteredIncoming = alarms.filter((alarm) => !this.locallyResolvedActiveAlarmIds.has(alarm.id));

		if (mode === 'replace') {
			this.activeAlarms$.next(filteredIncoming);
			return;
		}

		const current = this.activeAlarms$.getValue();
		const incomingIds = new Set(filteredIncoming.map((alarm) => alarm.id));
		const currentOnly = current.filter(
			(alarm) => !incomingIds.has(alarm.id) && !this.locallyResolvedActiveAlarmIds.has(alarm.id)
		);

		this.activeAlarms$.next([...filteredIncoming, ...currentOnly]);
	}

	public onAlarmTriggered(event: AlarmEvent): void {
		this.locallyResolvedActiveAlarmIds.delete(event.id);

		const current = this.activeAlarms$.getValue();
		const nextAlarm: ActiveAlarm = {
			id: event.id,
			alarmRuleId: event.alarmRuleId,
			deviceId: '-',
			alarmName: event.alarmName,
			priority: event.priority,
			activationTime: event.activationTime,
			resolutionTime: event.resolutionTime,
			position: 'posizione sconosciuta',
			userId: null,
			userUsername: null,
		};

		const existingIndex = current.findIndex((alarm) => alarm.id === event.id);
		if (existingIndex >= 0) {
			const updated = [...current];
			updated[existingIndex] = nextAlarm;
			this.activeAlarms$.next(updated);
			return;
		}

		this.activeAlarms$.next([nextAlarm, ...current]);
	}

	public onAlarmResolved(id: string): void {
		this.locallyResolvedActiveAlarmIds.add(id);
		const updated = this.activeAlarms$.getValue().filter((alarm) => alarm.id !== id);
		this.activeAlarms$.next(updated);
	}

	public onNotificationReceived(event: NotificationEvent): void {
		if (this.dismissedNotificationIds$.getValue().has(event.notificationId)) {
			return;
		}

		const withoutCurrentNotification = this.notifications$
			.getValue()
			.filter((notification) => notification.notificationId !== event.notificationId);

		this.notifications$.next([event, ...withoutCurrentNotification]);
	}

	public removeNotification(notificationId: string): void {
		const normalizedNotificationId = notificationId.trim();
		if (!normalizedNotificationId) {
			return;
		}

		this.dismissNotification(normalizedNotificationId);
		this.notifications$.next(
			this.notifications$
				.getValue()
				.filter((notification) => notification.notificationId !== normalizedNotificationId)
		);
	}

	public clearNotifications(): void {
		const notificationIds = this.notifications$.getValue().map((notification) => notification.notificationId);
		this.dismissNotifications(notificationIds);
		this.notifications$.next([]);
	}

	public dismissNotification(notificationId: string): void {
		this.dismissNotifications([notificationId]);
	}

	public dismissNotifications(notificationIds: ReadonlyArray<string>): void {
		if (notificationIds.length === 0) {
			return;
		}

		const nextDismissedIds = new Set(this.dismissedNotificationIds$.getValue());
		for (const notificationId of notificationIds) {
			const normalizedNotificationId = notificationId.trim();
			if (!normalizedNotificationId) {
				continue;
			}

			nextDismissedIds.add(normalizedNotificationId);
		}

		this.dismissedNotificationIds$.next(nextDismissedIds);
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

	public getDismissedNotificationIds$(): Observable<ReadonlySet<string>> {
		return this.dismissedNotificationIds$.asObservable();
	}

	public getUnreadNotificationsCount$(): Observable<number> {
		return this.notifications$.pipe(map((notifications) => notifications.length));
	}
}
