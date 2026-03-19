import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmEvent } from '../models/alarm-event.model';
import { NotificationEvent } from '../models/notification-event.model';
import { AlarmStateService } from './alarm-state.service';

describe('AlarmStateService', () => {
  let service: AlarmStateService;
  let subscriptions: Subscription[];

  const alarmEventA: AlarmEvent = {
    alarmId: 'alarm-1',
    alarmName: 'Pulsante antipanico',
    dangerSignal: 'HIGH',
    triggeredAt: '2026-03-19T10:00:00.000Z',
  };

  const alarmEventB: AlarmEvent = {
    alarmId: 'alarm-2',
    alarmName: 'Sensore porta',
    dangerSignal: 'MEDIUM',
    triggeredAt: '2026-03-19T10:01:00.000Z',
  };

  const notificationA: NotificationEvent = {
    notificationId: 'notification-1',
    title: 'Nuova nota di reparto',
    sentAt: '2026-03-19T10:02:00.000Z',
  };

  const notificationB: NotificationEvent = {
    notificationId: 'notification-2',
    title: 'Batteria quasi scarica',
    sentAt: '2026-03-19T10:03:00.000Z',
  };

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [AlarmStateService],
    });

    service = TestBed.inject(AlarmStateService);
    subscriptions = [];
  });

  afterEach(() => {
    for (const subscription of subscriptions) {
      subscription.unsubscribe();
    }

    service.ngOnDestroy();
    vi.useRealTimers();
  });

  it('inizializza lo stato con allarmi e notifiche vuoti', () => {
    const alarmsHistory: number[] = [];
    const notificationsHistory: number[] = [];

    subscriptions.push(
      service.getActiveAlarms$().subscribe((alarms) => {
        alarmsHistory.push(alarms.length);
      }),
      service.getNotifications$().subscribe((notifications) => {
        notificationsHistory.push(notifications.length);
      })
    );

    expect(alarmsHistory.at(-1)).toBe(0);
    expect(notificationsHistory.at(-1)).toBe(0);
  });

  it('aggiunge un nuovo allarme attivo quando viene chiamato onAlarmTriggered', () => {
    let latestAlarms = [] as ReturnType<typeof createAlarmCollector>;

    const alarms: AlarmEvent[] = [alarmEventA];
    subscriptions.push(
      service.getActiveAlarms$().subscribe((value) => {
        latestAlarms = createAlarmCollector(value);
      })
    );

    for (const alarm of alarms) {
      service.onAlarmTriggered(alarm);
    }

    expect(latestAlarms.length).toBe(1);
    expect(latestAlarms[0].alarmId).toBe(alarmEventA.alarmId);
    expect(latestAlarms[0].alarmName).toBe(alarmEventA.alarmName);
  });

  it("aggiorna un allarme esistente senza duplicarlo per alarmId", () => {
    const updatedEvent: AlarmEvent = {
      ...alarmEventA,
      alarmName: 'Nome allarme aggiornato',
      dangerSignal: 'CRITICAL',
    };

    let latestAlarms = [] as ReturnType<typeof createAlarmCollector>;

    subscriptions.push(
      service.getActiveAlarms$().subscribe((value) => {
        latestAlarms = createAlarmCollector(value);
      })
    );

    service.onAlarmTriggered(alarmEventA);
    service.onAlarmTriggered(updatedEvent);

    expect(latestAlarms.length).toBe(1);
    expect(latestAlarms[0].alarmId).toBe(alarmEventA.alarmId);
    expect(latestAlarms[0].alarmName).toBe('Nome allarme aggiornato');
    expect(latestAlarms[0].dangerSignal).toBe('CRITICAL');
  });

  it('rimuove solo l allarme target quando viene chiamato onAlarmResolved', () => {
    let latestAlarmIds: string[] = [];

    subscriptions.push(
      service.getActiveAlarms$().subscribe((alarms) => {
        latestAlarmIds = alarms.map((alarm) => alarm.alarmId);
      })
    );

    service.onAlarmTriggered(alarmEventA);
    service.onAlarmTriggered(alarmEventB);

    service.onAlarmResolved(alarmEventA.alarmId);

    expect(latestAlarmIds).toEqual([alarmEventB.alarmId]);
  });

  it('antepone le notifiche in modo che la piu recente sia la prima', () => {
    let latestNotificationIds: string[] = [];

    subscriptions.push(
      service.getNotifications$().subscribe((notifications) => {
        latestNotificationIds = notifications.map((notification) => notification.notificationId);
      })
    );

    service.onNotificationReceived(notificationA);
    service.onNotificationReceived(notificationB);

    expect(latestNotificationIds).toEqual([notificationB.notificationId, notificationA.notificationId]);
  });

  it('emette conteggi derivati corretti per allarmi e notifiche non lette', () => {
    let activeAlarmsCount = -1;
    let unreadNotificationsCount = -1;

    subscriptions.push(
      service.getActiveAlarmsCount$().subscribe((count) => {
        activeAlarmsCount = count;
      }),
      service.getUnreadNotificationsCount$().subscribe((count) => {
        unreadNotificationsCount = count;
      })
    );

    service.onAlarmTriggered(alarmEventA);
    service.onAlarmTriggered(alarmEventB);
    service.onNotificationReceived(notificationA);

    expect(activeAlarmsCount).toBe(2);
    expect(unreadNotificationsCount).toBe(1);

    service.onAlarmResolved(alarmEventA.alarmId);
    service.onNotificationReceived(notificationB);

    expect(activeAlarmsCount).toBe(1);
    expect(unreadNotificationsCount).toBe(2);
  });

  it('ricalcola elapsedTime nel tempo', () => {
    const now = new Date('2026-03-19T10:00:10.000Z');
    vi.setSystemTime(now);

    const alarmAtNow: AlarmEvent = {
      ...alarmEventA,
      triggeredAt: now.toISOString(),
    };

    let latestElapsedTime = -1;

    subscriptions.push(
      service.getActiveAlarms$().subscribe((alarms) => {
        latestElapsedTime = alarms[0]?.elapsedTime ?? -1;
      })
    );

    service.onAlarmTriggered(alarmAtNow);
    expect(latestElapsedTime).toBe(0);

    vi.advanceTimersByTime(3000);

    expect(latestElapsedTime).toBe(3000);
  });
});

function createAlarmCollector(
  alarms: Array<{
    alarmId: string;
    alarmName: string;
    dangerSignal: string;
    elapsedTime: number;
  }>
): Array<{
  alarmId: string;
  alarmName: string;
  dangerSignal: string;
  elapsedTime: number;
}> {
  return alarms.map((alarm) => ({
    alarmId: alarm.alarmId,
    alarmName: alarm.alarmName,
    dangerSignal: alarm.dangerSignal,
    elapsedTime: alarm.elapsedTime,
  }));
}
