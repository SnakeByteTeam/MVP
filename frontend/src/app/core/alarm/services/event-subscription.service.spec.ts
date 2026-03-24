import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Socket } from 'socket.io-client';
import { API_BASE_URL } from '../../tokens/api-base-url.token';
import { AlarmPriority } from '../models/alarm-priority.enum';
import { ConnectionStatus } from '../models/connection-status.enum';
import { PushEventType } from '../models/push-event-type.enum';
import { AlarmStateService } from './alarm-state.service';
import { EventSubscriptionService, SOCKET_IO_FACTORY } from './event-subscription.service';


type SocketEventHandler = (payload?: unknown) => void;

type FakeSocket = {
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  emit: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  removeAllListeners: ReturnType<typeof vi.fn>;
  trigger: (eventName: string, payload?: unknown) => void;
};

describe('EventSubscriptionService', () => {
  let service: EventSubscriptionService;
  let fakeSocket: FakeSocket;
  let socketIoFactoryMock: ReturnType<typeof vi.fn>;
  let subscriptions: Subscription[];

  const alarmStateSpy = {
    onAlarmTriggered: vi.fn(),
    onAlarmResolved: vi.fn(),
    onNotificationReceived: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    fakeSocket = createFakeSocket();
    socketIoFactoryMock = vi.fn(() => fakeSocket as unknown as Socket);

    TestBed.configureTestingModule({
      providers: [
        EventSubscriptionService,
        {
          provide: SOCKET_IO_FACTORY,
          useValue: socketIoFactoryMock,
        },
        {
          provide: AlarmStateService,
          useValue: alarmStateSpy,
        },
        {
          provide: API_BASE_URL,
          useValue: '  http://api.example.local  ',
        },
      ],
    });

    service = TestBed.inject(EventSubscriptionService);
    subscriptions = [];
  });

  afterEach(() => {
    for (const subscription of subscriptions) {
      subscription.unsubscribe();
    }

    service.ngOnDestroy();
  });

  it('crea la connessione socket in initialize usando API_BASE_URL normalizzato', () => {
    service.initialize([]);

    expect(socketIoFactoryMock).toHaveBeenCalledWith('http://api.example.local', {
      transports: ['websocket'],
      reconnection: true,
      autoConnect: true,
    });
  });

  it('aggiorna lo stato connessione su connect, reconnect attempt e disconnect', () => {
    const statuses: ConnectionStatus[] = [];
    subscriptions.push(
      service.getConnectionStatus$().subscribe((status) => {
        statuses.push(status);
      })
    );

    service.initialize([]);

    fakeSocket.trigger('connect');
    fakeSocket.trigger('reconnect_attempt');
    fakeSocket.trigger('disconnect');

    expect(statuses).toEqual([
      ConnectionStatus.DISCONNECTED,
      ConnectionStatus.CONNECTED,
      ConnectionStatus.RECONNECTING,
      ConnectionStatus.DISCONNECTED,
    ]);
  });

  it('esegue join e leave delle room con deduplicazione', () => {
    service.initialize([]);

    service.joinRoom('ward-1');
    service.joinRoom('ward-1');
    service.joinRoom(' ward-2 ');
    service.leaveRoom('ward-2');
    service.leaveRoom('ward-2');

    expect(fakeSocket.emit).toHaveBeenCalledWith('join-ward', 'ward-1');
    expect(fakeSocket.emit).toHaveBeenCalledWith('join-ward', 'ward-2');
    expect(fakeSocket.emit).toHaveBeenCalledWith('leave-ward', 'ward-2');

    const joinWardCalls = fakeSocket.emit.mock.calls.filter(([event]) => event === 'join-ward');
    const leaveWardCalls = fakeSocket.emit.mock.calls.filter(([event]) => event === 'leave-ward');

    expect(joinWardCalls.length).toBe(2);
    expect(leaveWardCalls.length).toBe(1);
  });

  it('riesegue il join delle room gia sottoscritte al connect', () => {
    service.initialize(['ward-a', 'ward-a']);

    const joinCallsBeforeReconnect = fakeSocket.emit.mock.calls.filter(
      ([event]) => event === 'join-ward'
    ).length;

    fakeSocket.trigger('connect');

    const joinCallsAfterReconnect = fakeSocket.emit.mock.calls.filter(
      ([event]) => event === 'join-ward'
    );

    expect(joinCallsBeforeReconnect).toBe(1);
    expect(joinCallsAfterReconnect.length).toBe(2);
    expect(joinCallsAfterReconnect.at(-1)).toEqual(['join-ward', 'ward-a']);
  });

  it('dispatcha gli eventi ALARM_TRIGGERED verso AlarmStateService', () => {
    service.initialize([]);

    fakeSocket.trigger('push-event', {
      eventType: PushEventType.ALARM_TRIGGERED,
      timestamp: '2026-03-19T10:00:00.000Z',
      payload: {
        activeAlarmId: 'active-alarm-123',
        alarmRuleId: 'alarm-rule-123',
        alarmName: 'Caduta rilevata',
        priority: AlarmPriority.RED,
        triggeredAt: '2026-03-19T10:00:00.000Z',
        resolvedAt: null,
        user_id: 'user-123',
      },
    });

    expect(alarmStateSpy.onAlarmTriggered).toHaveBeenCalledWith({
      activeAlarmId: 'active-alarm-123',
      alarmRuleId: 'alarm-rule-123',
      alarmName: 'Caduta rilevata',
      priority: AlarmPriority.RED,
      triggeredAt: '2026-03-19T10:00:00.000Z',
      resolvedAt: null,
      user_id: 'user-123',
    });
  });

  it('dispatcha gli eventi ALARM_RESOLVED con activeAlarmId', () => {
    service.initialize([]);

    fakeSocket.trigger('push-event', {
      eventType: PushEventType.ALARM_RESOLVED,
      timestamp: '2026-03-19T10:00:00.000Z',
      payload: {
        activeAlarmId: 'active-alarm-123',
      },
    });

    expect(alarmStateSpy.onAlarmResolved).toHaveBeenCalledWith('active-alarm-123');
  });

  it('dispatcha gli eventi NOTIFICATION verso AlarmStateService', () => {
    service.initialize([]);

    fakeSocket.trigger('push-event', {
      eventType: PushEventType.NOTIFICATION,
      timestamp: '2026-03-19T10:00:00.000Z',
      payload: {
        notificationId: 'notification-1',
        title: 'Messaggio operatore',
        sentAt: '2026-03-19T10:00:00.000Z',
      },
    });

    expect(alarmStateSpy.onNotificationReceived).toHaveBeenCalledWith({
      notificationId: 'notification-1',
      title: 'Messaggio operatore',
      sentAt: '2026-03-19T10:00:00.000Z',
    });
  });

  it('ignora eventi raw malformati e payload non validi', () => {
    service.initialize([]);

    fakeSocket.trigger('push-event', {
      eventType: 'UNKNOWN_EVENT',
      timestamp: '2026-03-19T10:00:00.000Z',
      payload: {},
    });

    fakeSocket.trigger('push-event', {
      eventType: PushEventType.ALARM_TRIGGERED,
      timestamp: '2026-03-19T10:00:00.000Z',
      payload: {
        activeAlarmId: 'active-alarm-123',
      },
    });

    fakeSocket.trigger('push-event', 'not-an-object');

    expect(alarmStateSpy.onAlarmTriggered).not.toHaveBeenCalled();
    expect(alarmStateSpy.onAlarmResolved).not.toHaveBeenCalled();
    expect(alarmStateSpy.onNotificationReceived).not.toHaveBeenCalled();
  });

  it('disconnette il socket e rimuove i listener alla distruzione', () => {
    service.initialize([]);

    service.ngOnDestroy();

    expect(fakeSocket.removeAllListeners).toHaveBeenCalled();
    expect(fakeSocket.disconnect).toHaveBeenCalled();
  });
});

function createFakeSocket(): FakeSocket {
  const listeners = new Map<string, Set<SocketEventHandler>>();

  const addHandler = (eventName: string, handler: SocketEventHandler): void => {
    if (!listeners.has(eventName)) {
      listeners.set(eventName, new Set<SocketEventHandler>());
    }

    listeners.get(eventName)?.add(handler);
  };

  const removeHandler = (eventName: string, handler: SocketEventHandler): void => {
    listeners.get(eventName)?.delete(handler);
  };

  const fakeSocket: FakeSocket = {
    on: vi.fn((eventName: string, handler: SocketEventHandler) => {
      addHandler(eventName, handler);
      return fakeSocket;
    }),
    off: vi.fn((eventName: string, handler: SocketEventHandler) => {
      removeHandler(eventName, handler);
      return fakeSocket;
    }),
    addListener: vi.fn((eventName: string, handler: SocketEventHandler) => {
      addHandler(eventName, handler);
      return fakeSocket;
    }),
    removeListener: vi.fn((eventName: string, handler: SocketEventHandler) => {
      removeHandler(eventName, handler);
      return fakeSocket;
    }),
    emit: vi.fn(),
    disconnect: vi.fn(),
    removeAllListeners: vi.fn(() => {
      listeners.clear();
      return fakeSocket;
    }),
    trigger: (eventName: string, payload?: unknown) => {
      for (const handler of listeners.get(eventName) ?? []) {
        handler(payload);
      }
    },
  };

  return fakeSocket;
}
