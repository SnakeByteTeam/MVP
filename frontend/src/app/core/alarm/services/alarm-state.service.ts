import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, interval, map, takeUntil } from 'rxjs';
import { ActiveAlarm } from '../models/active-alarm.model';
import { AlarmEvent } from '../models/alarm-event.model';
import { NotificationEvent } from '../models/notification-event.model';

@Injectable({ providedIn: 'root' })
export class AlarmStateService implements OnDestroy {
	private readonly activeAlarms$ = new BehaviorSubject<ActiveAlarm[]>([]);
	private readonly notifications$ = new BehaviorSubject<NotificationEvent[]>([]);
	private readonly destroy$ = new Subject<void>();

	constructor() {
		interval(1000)
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => this.refreshElapsedTimes());
	}

	public onAlarmTriggered(event: AlarmEvent): void {
		const current = this.activeAlarms$.getValue();
		const nextAlarm: ActiveAlarm = {
			alarmId: event.alarmId,
			alarmName: event.alarmName,
			dangerSignal: event.dangerSignal,
			triggeredAt: event.triggeredAt,
			elapsedTime: this.computeElapsedTime(event.triggeredAt),
		};

		const existingIndex = current.findIndex((alarm) => alarm.alarmId === event.alarmId);
		if (existingIndex >= 0) {
			const updated = [...current];
			updated[existingIndex] = nextAlarm;
			this.activeAlarms$.next(updated);
			return;
		}

		this.activeAlarms$.next([nextAlarm, ...current]);
	}

	public onAlarmResolved(alarmId: string): void {
		const updated = this.activeAlarms$.getValue().filter((alarm) => alarm.alarmId !== alarmId);
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

	public ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private refreshElapsedTimes(): void {
		const current = this.activeAlarms$.getValue();
		if (current.length === 0) {
			return;
		}

		this.activeAlarms$.next(
			current.map((alarm) => ({
				...alarm,
				elapsedTime: this.computeElapsedTime(alarm.triggeredAt),
			}))
		);
	}

	private computeElapsedTime(triggeredAt: string): number {
		const triggeredAtTimestamp = Date.parse(triggeredAt);
		if (Number.isNaN(triggeredAtTimestamp)) {
			return 0;
		}

		return Math.max(Date.now() - triggeredAtTimestamp, 0);
	}
}
