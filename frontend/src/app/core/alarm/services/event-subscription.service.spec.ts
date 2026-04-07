import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subscription, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Socket } from 'socket.io-client';
import { API_BASE_URL } from '../../tokens/api-base-url.token';
import { InternalAuthService } from '../../services/internal-auth.service';
import { ConnectionStatus } from '../models/connection-status.enum';
import { AlarmStateService } from './alarm-state.service';
import { EventSubscriptionService, SOCKET_IO_FACTORY } from './event-subscription.service';
import { UserRole } from '../../models/user-role.enum';
import { UserSession } from '../../../features/user-auth/models/user-session.model';


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
  let currentUser$: BehaviorSubject<UserSession | null>;
  let internalAuthServiceSpy: { getCurrentUser$: ReturnType<typeof vi.fn> };
  let httpClientSpy: { get: ReturnType<typeof vi.fn> };

  const alarmStateSpy = {
    onAlarmTriggered: vi.fn(),
    onAlarmResolved: vi.fn(),
    onNotificationReceived: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    fakeSocket = createFakeSocket();
    socketIoFactoryMock = vi.fn(() => fakeSocket as unknown as Socket);
    currentUser$ = new BehaviorSubject<UserSession | null>(null);
    internalAuthServiceSpy = {
      getCurrentUser$: vi.fn(() => currentUser$.asObservable()),
    };
    httpClientSpy = {
      get: vi.fn(() => of([])),
    };

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
        {
          provide: InternalAuthService,
          useValue: internalAuthServiceSpy,
        },
        {
          provide: HttpClient,
          useValue: httpClientSpy,
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

    currentUser$.complete();
    service.ngOnDestroy();
  });

  it('crea la connessione socket in initialize usando API_BASE_URL normalizzato', () => {
    service.initialize([]);

    expect(socketIoFactoryMock).toHaveBeenCalledWith('http://api.example.local/ws', {
      transports: ['websocket'],
      reconnection: true,
      autoConnect: true,
    });
  });

  it('risolve il namespace websocket ws quando API_BASE_URL termina con api', () => {
    TestBed.resetTestingModule();

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
          useValue: 'http://localhost/api',
        },
        {
          provide: InternalAuthService,
          useValue: internalAuthServiceSpy,
        },
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
      ],
    });

    service = TestBed.inject(EventSubscriptionService);
    service.initialize([]);

    expect(socketIoFactoryMock).toHaveBeenCalledWith('http://localhost/ws', {
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

  it('bootstrap delle room da plant all al login quando cache ward e vuota', () => {
    httpClientSpy.get.mockReturnValue(
      of([
        { id: 'plant-1', wardId: 21 },
        { id: 'plant-2', wardId: ' 22 ' },
        { id: 'plant-3', wardId: 21 },
        { id: 'plant-4' },
      ])
    );

    service.initialize([]);
    currentUser$.next(buildSession('oss-1'));

    expect(httpClientSpy.get).toHaveBeenCalledWith('http://api.example.local/plant/all');

    const joinWardCalls = fakeSocket.emit.mock.calls.filter(([event]) => event === 'join-ward');
    expect(joinWardCalls).toEqual([
      ['join-ward', '21'],
      ['join-ward', '22'],
    ]);
  });

  it('non interrompe il realtime quando bootstrap plant all fallisce', () => {
    httpClientSpy.get.mockReturnValue(throwError(() => new Error('network')));

    service.initialize([]);
    currentUser$.next(buildSession('oss-2'));

    expect(httpClientSpy.get).toHaveBeenCalledTimes(1);

    fakeSocket.trigger('push-event', {
      alarmRuleId: 'alarm-rule-bootstrap-fallback',
      wardId: 15,
      alarmEventId: 'active-alarm-bootstrap-fallback',
    });

    expect(alarmStateSpy.onAlarmTriggered).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'active-alarm-bootstrap-fallback',
      }),
    );
    expect(alarmStateSpy.onNotificationReceived).toHaveBeenCalledWith(
      expect.objectContaining({
        notificationId: 'alarm-triggered-active-alarm-bootstrap-fallback',
      }),
    );
  });

  it('evita bootstrap ripetuto per lo stesso utente nella stessa sessione', () => {
    httpClientSpy.get.mockReturnValue(of([]));

    service.initialize([]);
    currentUser$.next(buildSession('oss-3'));
    currentUser$.next(buildSession('oss-3'));

    expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
  });

  it('gestisce payload backend nativo su push-event per allarme attivato', () => {
    service.initialize([]);

    fakeSocket.trigger('push-event', {
      alarmRuleId: 'alarm-rule-backend-1',
      wardId: 12,
      alarmEventId: 'active-alarm-backend-1',
    });

    expect(alarmStateSpy.onAlarmTriggered).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'active-alarm-backend-1',
        alarmRuleId: 'alarm-rule-backend-1',
        alarmName: 'Allarme in corso',
      }),
    );

    expect(alarmStateSpy.onNotificationReceived).toHaveBeenCalledWith(
      expect.objectContaining({
        notificationId: 'alarm-triggered-active-alarm-backend-1',
        title: "C'e un allarme in corso",
      }),
    );

    expect(fakeSocket.emit).toHaveBeenCalledWith('join-ward', '12');
  });

  it('gestisce canale backend alarm-resolved e aggiorna stato/notifiche', () => {
    service.initialize([]);

    fakeSocket.trigger('alarm-resolved', {
      alarmEventId: 'active-alarm-backend-2',
      wardId: 13,
    });

    expect(alarmStateSpy.onAlarmResolved).toHaveBeenCalledWith('active-alarm-backend-2');
    expect(alarmStateSpy.onNotificationReceived).toHaveBeenCalledWith(
      expect.objectContaining({
        notificationId: 'alarm-resolved-active-alarm-backend-2',
        title: 'Allarme risolto',
      }),
    );
    expect(fakeSocket.emit).toHaveBeenCalledWith('join-ward', '13');
  });

  it('ignora eventi raw malformati e payload backend non validi', () => {
    service.initialize([]);

    fakeSocket.trigger('push-event', {
      alarmRuleId: 'alarm-rule-backend-3',
      wardId: 'not-a-number',
      alarmEventId: 'active-alarm-backend-3',
    });

    fakeSocket.trigger('push-event', 'not-an-object');

    fakeSocket.trigger('alarm-resolved', {
      alarmEventId: 42,
      wardId: 10,
    });

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

function buildSession(userId: string): UserSession {
  return {
    userId,
    username: `${userId}@example.local`,
    role: UserRole.OPERATORE_SANITARIO,
    accessToken: 'test-token',
    isFirstAccess: false,
  };
}
