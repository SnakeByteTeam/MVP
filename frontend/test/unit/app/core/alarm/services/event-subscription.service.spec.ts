import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subscription, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Socket } from 'socket.io-client';
import { API_BASE_URL } from 'src/app/core/tokens/api-base-url.token';
import { InternalAuthService } from 'src/app/core/services/internal-auth.service';
import { ConnectionStatus } from 'src/app/core/alarm/models/connection-status.enum';
import { AlarmPriority } from 'src/app/core/alarm/models/alarm-priority.enum';
import { AlarmStateService } from 'src/app/core/alarm/services/alarm-state.service';
import { AlarmApiService } from 'src/app/core/alarm/services/alarm-api.service';
import { EventSubscriptionService, SOCKET_IO_FACTORY } from 'src/app/core/alarm/services/event-subscription.service';
import { UserRole } from 'src/app/core/models/user-role.enum';
import { UserSession } from 'src/app/features/user-auth/models/user-session.model';


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
  let alarmApiServiceSpy: { getAlarmEventById: ReturnType<typeof vi.fn> };

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
    alarmApiServiceSpy = {
      getAlarmEventById: vi.fn(() =>
        of({
          id: 'active-alarm-backend-1',
          alarmRuleId: 'alarm-rule-backend-1',
          deviceId: 'device-1',
          alarmName: 'Saturazione bassa reparto A',
          priority: AlarmPriority.RED,
          activationTime: '2026-04-07T10:00:00.000Z',
          resolutionTime: null,
          position: 'Stanza 12',
          userId: null,
          userUsername: null,
        })
      ),
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
        {
          provide: AlarmApiService,
          useValue: alarmApiServiceSpy,
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
        {
          provide: AlarmApiService,
          useValue: alarmApiServiceSpy,
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

  it('refreshWardRoomSubscription riallinea le room joinate senza reload pagina', () => {
    httpClientSpy.get
      .mockReturnValueOnce(of([{ id: 'plant-1', wardId: 10 }]))
      .mockReturnValueOnce(of([{ id: 'plant-2', wardId: 11 }]));

    service.initialize([]);
    currentUser$.next(buildSession('oss-4'));

    service.refreshWardRoomSubscription();

    expect(httpClientSpy.get).toHaveBeenCalledTimes(2);
    expect(fakeSocket.emit).toHaveBeenCalledWith('join-ward', '10');
    expect(fakeSocket.emit).toHaveBeenCalledWith('leave-ward', '10');
    expect(fakeSocket.emit).toHaveBeenCalledWith('join-ward', '11');
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
        alarmName: 'Saturazione bassa reparto A',
      }),
    );

    expect(alarmStateSpy.onNotificationReceived).toHaveBeenCalledWith(
      expect.objectContaining({
        notificationId: 'alarm-triggered-active-alarm-backend-1',
        title: '▲ Saturazione bassa reparto A',
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

  describe('Internal priority, detail resolution and plant array extractors', () => {
    it('uses fallback alarm details when API fails', () => {
       alarmApiServiceSpy.getAlarmEventById.mockReturnValue(throwError(() => new Error('API failed')));
       service.initialize([]);

       fakeSocket.trigger('push-event', {
          alarmRuleId: 'rule-test',
          wardId: 10,
          alarmEventId: 'fallback-event',
        });
        
        expect(alarmStateSpy.onAlarmTriggered).toHaveBeenCalledWith(
          expect.objectContaining({
            alarmName: 'Allarme in corso',
            priority: AlarmPriority.ORANGE // The hardcoded fallback priority
          })
        );
    });

    it('handles resolving triggers with malformed priority via API', () => {
       alarmApiServiceSpy.getAlarmEventById.mockReturnValue(of({
           id: '1',
           alarmName: '   ', // blank name defaults to Allarme in corso
           priority: 'INVALID_PRIORITY_STRING' // should normalize to fallback
       }));
       service.initialize([]);

       fakeSocket.trigger('push-event', {
          alarmRuleId: 'rule-test-2',
          wardId: 10,
          alarmEventId: 'malformed-priority-event',
        });
        
        expect(alarmStateSpy.onAlarmTriggered).toHaveBeenCalledWith(
          expect.objectContaining({
            alarmName: 'Allarme in corso', // blank trimmed
            priority: AlarmPriority.ORANGE // invalid resolves to fallback
          })
        );
    });

    it('handles numeric priorities in normalizeAlarmPriority', () => {
       alarmApiServiceSpy.getAlarmEventById.mockReturnValue(of({
           id: '1',
           alarmName: 'Test num priority',
           priority: 3 // AlarmPriority.RED = 3 usually
       }));
       service.initialize([]);

       fakeSocket.trigger('push-event', {
          alarmRuleId: 'rule-test-3',
          wardId: 10,
          alarmEventId: 'num-priority',
        });
        
        expect(alarmStateSpy.onAlarmTriggered).toHaveBeenCalledWith(
          expect.objectContaining({
            priority: 3 
          })
        );
    });
    
    it('handles string enum keys in normalizeAlarmPriority', () => {
       alarmApiServiceSpy.getAlarmEventById.mockReturnValue(of({
           id: '1',
           alarmName: 'Test string enum',
           priority: 'red' // Should normalize to RED
       }));
       service.initialize([]);

       fakeSocket.trigger('push-event', {
          alarmRuleId: 'rule-test-4',
          wardId: 10,
          alarmEventId: 'string-priority',
        });
        
        expect(alarmStateSpy.onAlarmTriggered).toHaveBeenCalledWith(
          expect.objectContaining({
            priority: AlarmPriority.RED // 3
          })
        );
    });

    it('extracts plant array correctly from different response formats (data wrapper)', () => {
      httpClientSpy.get.mockReturnValue(of({ data: [{ wardId: 50 }, { invalid: true }, null] }));
      service.initialize([]);
      currentUser$.next(buildSession('user-extract'));
      
      expect(fakeSocket.emit).toHaveBeenCalledWith('join-ward', '50');
    });

    it('extracts plant array correctly from different response formats (plants wrapper)', () => {
      httpClientSpy.get.mockReturnValue(of({ plants: [{ wardId: 60 }] }));
      service.initialize([]);
      currentUser$.next(buildSession('user-extract-2'));

      expect(fakeSocket.emit).toHaveBeenCalledWith('join-ward', '60');
    });

    it('falls back to empty array when plant response has no known wrapper', () => {
      httpClientSpy.get.mockReturnValue(of({ unknown: 'structure' }));
      service.initialize([]);
      currentUser$.next(buildSession('user-no-wrapper'));

      const joinCalls = fakeSocket.emit.mock.calls.filter(([e]) => e === 'join-ward');
      expect(joinCalls.length).toBe(0);
    });
  });

  it('refreshWardRoomSubscription non fa nulla se activeUserId e null', () => {
    service.initialize([]);
    // Never logged in so activeUserId is null
    service.refreshWardRoomSubscription();
    // httpClient.get should NOT have been called (bootstrap requires active user)
    expect(httpClientSpy.get).not.toHaveBeenCalled();
  });

  it('initialize chiamata due volte non crea un secondo socket', () => {
    service.initialize([]);
    service.initialize([]);
    expect(socketIoFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('login poi logout ripulisce le collection wardBootstrap e deattiva le room', () => {
    httpClientSpy.get.mockReturnValue(of([{ id: 'p1', wardId: 99 }]));

    service.initialize([]);
    currentUser$.next(buildSession('oss-logout'));

    // Joined ward 99 from bootstrap
    expect(fakeSocket.emit).toHaveBeenCalledWith('join-ward', '99');

    // Simulate logout
    currentUser$.next(null);

    const leaveWardCalls = fakeSocket.emit.mock.calls.filter(([e]) => e === 'leave-ward');
    expect(leaveWardCalls.some(([, id]) => id === '99')).toBe(true);
  });

  it('alarm-resolved senza wardId numerico non chiama joinRoom per il ward', () => {
    service.initialize([]);

    fakeSocket.trigger('alarm-resolved', {
      alarmEventId: 'ev-no-ward',
      wardId: 'not-a-number', // non-numeric wardId → should not call joinRoom
    });

    // alarmResolved should still be called
    expect(alarmStateSpy.onAlarmResolved).toHaveBeenCalledWith('ev-no-ward');
    // join-ward should NOT have been called specifically for this event's wardId
    const joinCalls = fakeSocket.emit.mock.calls.filter(([e, id]) => e === 'join-ward' && id === 'not-a-number');
    expect(joinCalls.length).toBe(0);
  });

  it('ensureAuthLifecycleSubscription e no-op se authLifecycleInitialized e gia vero (doppio initialize)', () => {
    service.initialize([]);
    currentUser$.next(buildSession('oss-double'));
    const callsAfterFirst = httpClientSpy.get.mock.calls.length;

    service.initialize([]); // second call – should not re-subscribe
    currentUser$.next(buildSession('oss-double'));

    // No additional HTTP calls from re-subscription
    expect(httpClientSpy.get.mock.calls.length).toBe(callsAfterFirst);
  });

  it('resolvePlantAllEndpoint usa /api/plant/all se API_BASE_URL non e impostato', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        EventSubscriptionService,
        { provide: SOCKET_IO_FACTORY, useValue: socketIoFactoryMock },
        { provide: AlarmStateService, useValue: alarmStateSpy },
        { provide: InternalAuthService, useValue: internalAuthServiceSpy },
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: AlarmApiService, useValue: alarmApiServiceSpy },
        // No API_BASE_URL token so it defaults to null/undefined
      ],
    });

    const noUrlService = TestBed.inject(EventSubscriptionService);
    noUrlService.initialize([]);
    currentUser$.next(buildSession('oss-no-url'));

    expect(httpClientSpy.get).toHaveBeenCalledWith('/api/plant/all');
    noUrlService.ngOnDestroy();
  });

  describe('Edge cases and Private method branches', () => {
    it('non fa niente in bootstrapWardRoomSubscription se http non esiste', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          EventSubscriptionService,
          { provide: SOCKET_IO_FACTORY, useValue: socketIoFactoryMock },
          { provide: AlarmStateService, useValue: alarmStateSpy },
          { provide: InternalAuthService, useValue: internalAuthServiceSpy },
          { provide: AlarmApiService, useValue: alarmApiServiceSpy },
        ],
      });

      const noHttpService = TestBed.inject(EventSubscriptionService);
      noHttpService.initialize([]);
      currentUser$.next(buildSession('test-usr'));
      
      expect(fakeSocket.emit).not.toHaveBeenCalled();
      noHttpService.ngOnDestroy();
    });

    it('resolveTriggeredAlarmDetails usa il fallback se alarmApiService non c e', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          EventSubscriptionService,
          { provide: SOCKET_IO_FACTORY, useValue: socketIoFactoryMock },
          { provide: AlarmStateService, useValue: alarmStateSpy },
          { provide: HttpClient, useValue: httpClientSpy },
        ],
      });

      const noAlarmApiService = TestBed.inject(EventSubscriptionService);
      noAlarmApiService.initialize([]);
      fakeSocket.trigger('connect');
      fakeSocket.trigger('push-event', { alarmEventId: 'ev1', alarmRuleId: 'r1', wardId: 5 });

      expect(alarmStateSpy.onAlarmTriggered).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: AlarmPriority.ORANGE,
          alarmName: 'Allarme in corso',
        })
      );
      noAlarmApiService.ngOnDestroy();
    });

    it('ignora il login se l userId e popolato solo da spazi', () => {
      service.initialize([]);
      currentUser$.next(buildSession('   '));
      
      expect(httpClientSpy.get).not.toHaveBeenCalled();
      expect(fakeSocket.emit).not.toHaveBeenCalled();
    });

    it('extractPlantArray ignora i payload che non contengono un array plants (es. oggetti null/stringhe, o data vuoto)', () => {
      httpClientSpy.get.mockReturnValue(of({ plants: null, data: null }));
      service.initialize([]);
      currentUser$.next(buildSession('user-weird-response'));
      
      expect(fakeSocket.emit).not.toHaveBeenCalledWith('join-ward', expect.any(String));

      httpClientSpy.get.mockReturnValue(of(1234));
      service.refreshWardRoomSubscription();
      expect(fakeSocket.emit).not.toHaveBeenCalledWith('join-ward', expect.any(String));
    });

    it('normalizeWardId ignora se wardId e privo di valore, ma accetta se int', () => {
      httpClientSpy.get.mockReturnValue(of([
        { wardId: '' },
        { wardId: '   ' },
        { wardId: null },
        { wardId: 25 },
      ]));
      service.initialize([]);
      currentUser$.next(buildSession('user-normalize'));
      
      expect(fakeSocket.emit).toHaveBeenCalledWith('join-ward', '25');
    });

    it('syncJoinedRoomsWithWardIds riutilizza stanze gia caricate e join multiple rooms', () => {
      httpClientSpy.get.mockImplementationOnce(() => of([{ wardId: '10' }]));
      service.initialize([]);
      currentUser$.next(buildSession('user-sync'));
      
      expect(fakeSocket.emit).toHaveBeenCalledWith('join-ward', '10');
      fakeSocket.emit.mockClear();

      httpClientSpy.get.mockImplementationOnce(() => of([{ wardId: '10' }, { wardId: '20' }]));
      service.refreshWardRoomSubscription();
      
      expect(fakeSocket.emit).toHaveBeenCalledWith('join-ward', '20');
      expect(fakeSocket.emit).not.toHaveBeenCalledWith('join-ward', '10');
    });

    it('normalizeAlarmPriority fallback con null su stringhe non valide e enum parse', () => {
      alarmStateSpy.onAlarmTriggered.mockClear();
      alarmApiServiceSpy.getAlarmEventById.mockClear();

      alarmApiServiceSpy.getAlarmEventById.mockImplementationOnce(() => of({
        alarmName: 'Stanza 11',
        priority: 'unknown-priority'
      }));

      service.initialize([]);
      fakeSocket.trigger('connect');
      fakeSocket.trigger('push-event', { alarmEventId: 'ev2', alarmRuleId: 'r2', wardId: 5 });

      expect(alarmStateSpy.onAlarmTriggered).toHaveBeenCalledWith(
        expect.objectContaining({ priority: AlarmPriority.ORANGE })
      );

      alarmStateSpy.onAlarmTriggered.mockClear();
      alarmApiServiceSpy.getAlarmEventById.mockImplementationOnce(() => of({
        alarmName: 'Stanza 12',
        priority: 'RED'
      }));
      fakeSocket.trigger('push-event', { alarmEventId: 'ev3', alarmRuleId: 'r3', wardId: 5 });
      expect(alarmStateSpy.onAlarmTriggered).toHaveBeenCalledWith(
        expect.objectContaining({ priority: AlarmPriority.RED })
      );

      alarmStateSpy.onAlarmTriggered.mockClear();
      alarmApiServiceSpy.getAlarmEventById.mockImplementationOnce(() => of({
        alarmName: 'Stanza 13',
        priority: String(AlarmPriority.WHITE)
      }));
      fakeSocket.trigger('push-event', { alarmEventId: 'ev4', alarmRuleId: 'r4', wardId: 5 });
      expect(alarmStateSpy.onAlarmTriggered).toHaveBeenCalledWith(
        expect.objectContaining({ priority: AlarmPriority.ORANGE })
      );

      alarmStateSpy.onAlarmTriggered.mockClear();
      alarmApiServiceSpy.getAlarmEventById.mockImplementationOnce(() => of({
        alarmName: 'Stanza 14',
        priority: {}
      }));
      fakeSocket.trigger('push-event', { alarmEventId: 'ev5', alarmRuleId: 'r5', wardId: 5 });
      expect(alarmStateSpy.onAlarmTriggered).toHaveBeenCalledWith(
        expect.objectContaining({ priority: AlarmPriority.ORANGE })
      );
    });
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
