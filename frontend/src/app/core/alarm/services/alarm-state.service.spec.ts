import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AlarmEvent } from '../models/alarm-event.model';
import { AlarmPriority } from '../models/alarm-priority.enum';
import { ActiveAlarm } from '../models/active-alarm.model';
import { NotificationEvent } from '../../../features/notification/models/notification-event.model';
import { AlarmStateService } from './alarm-state.service';

describe('AlarmStateService', () => {
  let service: AlarmStateService;
  let subscriptions: Subscription[];

  const alarmEventA: AlarmEvent = {
    id: 'active-alarm-1',
    alarmRuleId: 'alarm-rule-1',
    alarmName: 'Pulsante antipanico',
    priority: AlarmPriority.RED,
    activationTime: '2026-03-19T10:00:00.000Z',
    resolutionTime: null,
  };

  const alarmEventB: AlarmEvent = {
    id: 'active-alarm-2',
    alarmRuleId: 'alarm-rule-2',
    alarmName: 'Sensore porta',
    priority: AlarmPriority.ORANGE,
    activationTime: '2026-03-19T10:01:00.000Z',
    resolutionTime: null,
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
    expect(latestAlarms[0].id).toBe(alarmEventA.id);
    expect(latestAlarms[0].alarmRuleId).toBe(alarmEventA.alarmRuleId);
    expect(latestAlarms[0].alarmName).toBe(alarmEventA.alarmName);
    expect(latestAlarms[0].priority).toBe(alarmEventA.priority);
    expect(latestAlarms[0].resolutionTime).toBe(alarmEventA.resolutionTime);
  });

  it("aggiorna un allarme esistente senza duplicarlo per id istanza", () => {
    const updatedEvent: AlarmEvent = {
      ...alarmEventA,
      alarmName: 'Nome allarme aggiornato',
      priority: AlarmPriority.WHITE,
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
    expect(latestAlarms[0].id).toBe(alarmEventA.id);
    expect(latestAlarms[0].alarmName).toBe('Nome allarme aggiornato');
    expect(latestAlarms[0].priority).toBe(AlarmPriority.WHITE);
    expect(latestAlarms[0].resolutionTime).toBe(updatedEvent.resolutionTime);
  });

  it('rimuove solo l allarme target quando viene chiamato onAlarmResolved', () => {
    let latestActiveAlarmIds: string[] = [];

    subscriptions.push(
      service.getActiveAlarms$().subscribe((alarms) => {
        latestActiveAlarmIds = alarms.map((alarm) => alarm.id);
      })
    );

    service.onAlarmTriggered(alarmEventA);
    service.onAlarmTriggered(alarmEventB);

    service.onAlarmResolved(alarmEventA.id);

    expect(latestActiveAlarmIds).toEqual([alarmEventB.id]);
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

  it('setActiveAlarms imposta snapshot iniziale degli allarmi attivi', () => {
    let latestActiveAlarmIds: string[] = [];

    const snapshot: ActiveAlarm[] = [
      {
        id: 'snapshot-1',
        alarmRuleId: 'rule-1',
        alarmName: 'Snapshot allarme',
        priority: AlarmPriority.RED,
        activationTime: '2026-03-19T10:00:00.000Z',
        resolutionTime: null,
      },
    ];

    subscriptions.push(
      service.getActiveAlarms$().subscribe((alarms) => {
        latestActiveAlarmIds = alarms.map((alarm) => alarm.id);
      })
    );

    service.setActiveAlarms(snapshot);

    expect(latestActiveAlarmIds).toEqual(['snapshot-1']);
  });

  it('setActiveAlarms preserva eventuali allarmi locali non inclusi nello snapshot', () => {
    let latestActiveAlarmIds: string[] = [];

    const snapshot: ActiveAlarm[] = [
      {
        id: 'snapshot-1',
        alarmRuleId: 'rule-1',
        alarmName: 'Snapshot allarme',
        priority: AlarmPriority.RED,
        activationTime: '2026-03-19T10:00:00.000Z',
        resolutionTime: null,
      },
    ];

    subscriptions.push(
      service.getActiveAlarms$().subscribe((alarms) => {
        latestActiveAlarmIds = alarms.map((alarm) => alarm.id);
      })
    );

    service.onAlarmTriggered(alarmEventA);
    service.setActiveAlarms(snapshot);

    expect(latestActiveAlarmIds).toEqual(['snapshot-1', alarmEventA.id]);
  });

  it('setActiveAlarms non reintroduce allarmi gia risolti localmente', () => {
    let latestActiveAlarmIds: string[] = [];

    const staleSnapshot: ActiveAlarm[] = [
      {
        id: alarmEventA.id,
        alarmRuleId: alarmEventA.alarmRuleId,
        alarmName: alarmEventA.alarmName,
        priority: alarmEventA.priority,
        activationTime: alarmEventA.activationTime,
        resolutionTime: null,
      },
    ];

    subscriptions.push(
      service.getActiveAlarms$().subscribe((alarms) => {
        latestActiveAlarmIds = alarms.map((alarm) => alarm.id);
      })
    );

    service.onAlarmTriggered(alarmEventA);
    service.onAlarmResolved(alarmEventA.id);
    service.setActiveAlarms(staleSnapshot);

    expect(latestActiveAlarmIds).toEqual([]);
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

    service.onAlarmResolved(alarmEventA.id);
    service.onNotificationReceived(notificationB);

    expect(activeAlarmsCount).toBe(1);
    expect(unreadNotificationsCount).toBe(2);
  });
});

function createAlarmCollector(
  alarms: Array<{
    id: string;
    alarmRuleId: string;
    alarmName: string;
    priority: AlarmPriority;
    activationTime: string;
    resolutionTime: string | null;
  }>
): Array<{
  id: string;
  alarmRuleId: string;
  alarmName: string;
  priority: AlarmPriority;
  activationTime: string;
  resolutionTime: string | null;
}> {
  return alarms.map((alarm) => ({
    id: alarm.id,
    alarmRuleId: alarm.alarmRuleId,
    alarmName: alarm.alarmName,
    priority: alarm.priority,
    activationTime: alarm.activationTime,
    resolutionTime: alarm.resolutionTime,
  }));
}
