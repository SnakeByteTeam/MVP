import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable, Subscription, firstValueFrom, of, skip, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmStateService } from '../../../core/alarm/services/alarm-state.service';
import { NotificationApiService } from '../../../core/notification/services/notification-api.service';
import type { NotificationEvent } from '../models/notification-event.model';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
    let service: NotificationService;
    let notificationsSubject: BehaviorSubject<NotificationEvent[]>;
    let unreadCountSubject: BehaviorSubject<number>;

    const alarmStateStub = {
        getNotifications$: vi.fn(),
        getUnreadNotificationsCount$: vi.fn(),
    };

    const notificationApiStub = {
        getNotificationsHistory: vi.fn<() => Observable<NotificationEvent[]>>(),
    };

    const historyOlder: NotificationEvent = {
        notificationId: 'historic-1',
        title: 'Storico vecchio',
        sentAt: '2026-03-24T08:00:00.000Z',
    };

    const sharedHistoric: NotificationEvent = {
        notificationId: 'shared-id',
        title: 'Storico duplicato',
        sentAt: '2026-03-24T09:00:00.000Z',
    };

    const sharedInSession: NotificationEvent = {
        notificationId: 'shared-id',
        title: 'Push aggiornato',
        sentAt: '2026-03-24T11:00:00.000Z',
    };

    const inSessionOnly: NotificationEvent = {
        notificationId: 'session-1',
        title: 'Nuova push',
        sentAt: '2026-03-24T10:30:00.000Z',
    };

    beforeEach(() => {
        vi.clearAllMocks();

        notificationsSubject = new BehaviorSubject<NotificationEvent[]>([]);
        unreadCountSubject = new BehaviorSubject<number>(0);

        alarmStateStub.getNotifications$.mockReturnValue(notificationsSubject.asObservable());
        alarmStateStub.getUnreadNotificationsCount$.mockReturnValue(unreadCountSubject.asObservable());
        notificationApiStub.getNotificationsHistory.mockReturnValue(of([]));

        TestBed.configureTestingModule({
            providers: [
                NotificationService,
                { provide: AlarmStateService, useValue: alarmStateStub },
                { provide: NotificationApiService, useValue: notificationApiStub },
            ],
        });
    });

    it('espone vm iniziale vuoto quando storico e stream in-session sono vuoti', async () => {
        service = TestBed.inject(NotificationService);
        const vm = await firstValueFrom(service.vm$);

        expect(vm).toEqual({
            notifications: [],
            unreadCount: 0,
        });
    });

    it('combina storico e in-session, deduplica per notificationId e ordina per sentAt desc', async () => {
        notificationApiStub.getNotificationsHistory.mockReturnValueOnce(of([historyOlder, sharedHistoric]));
        notificationsSubject.next([sharedInSession, inSessionOnly]);
        unreadCountSubject.next(2);

        service = TestBed.inject(NotificationService);
        const vm = await firstValueFrom(service.vm$);

        expect(vm.unreadCount).toBe(2);
        expect(vm.notifications).toEqual([sharedInSession, inSessionOnly, historyOlder]);
        expect(vm.notifications).toHaveLength(3);
    });

    it('in errore sullo storico applica fallback a [] e mantiene i dati in-session', async () => {
        notificationApiStub.getNotificationsHistory.mockReturnValueOnce(
            throwError(() => new Error('errore rete'))
        );
        notificationsSubject.next([inSessionOnly]);
        unreadCountSubject.next(1);

        service = TestBed.inject(NotificationService);
        const vm = await firstValueFrom(service.vm$);

        expect(vm.notifications).toEqual([inSessionOnly]);
        expect(vm.unreadCount).toBe(1);
    });

    it('propaga nuovi unreadCount senza alterare la lista notifiche', async () => {
        notificationApiStub.getNotificationsHistory.mockReturnValueOnce(of([historyOlder]));

        service = TestBed.inject(NotificationService);
        await firstValueFrom(service.vm$);

        unreadCountSubject.next(5);
        const vm = await firstValueFrom(service.vm$);

        expect(vm.notifications).toEqual([historyOlder]);
        expect(vm.unreadCount).toBe(5);
    });

    it('aggiorna il vm quando arrivano nuove notifiche in-session dopo la prima emissione', async () => {
        notificationApiStub.getNotificationsHistory.mockReturnValueOnce(of([historyOlder]));

        service = TestBed.inject(NotificationService);
        const updatedVmPromise = firstValueFrom(service.vm$.pipe(skip(1)));
        notificationsSubject.next([inSessionOnly]);
        const vm = await updatedVmPromise;

        expect(vm.notifications).toEqual([inSessionOnly, historyOlder]);
        expect(vm.unreadCount).toBe(0);
    });

    it('deduplica tenendo la versione in-session quando notificationId e presente anche nello storico', async () => {
        notificationApiStub.getNotificationsHistory.mockReturnValueOnce(of([sharedHistoric]));
        notificationsSubject.next([sharedInSession]);

        service = TestBed.inject(NotificationService);
        const vm = await firstValueFrom(service.vm$);

        expect(vm.notifications).toEqual([sharedInSession]);
        expect(vm.notifications).toHaveLength(1);
    });

    it('gestisce timestamp non validi senza lanciare errori e li ordina in fondo', async () => {
        const invalidTimestampNotification: NotificationEvent = {
            notificationId: 'invalid-ts',
            title: 'Timestamp invalido',
            sentAt: 'not-a-date',
        };

        notificationApiStub.getNotificationsHistory.mockReturnValueOnce(
            of([invalidTimestampNotification, historyOlder])
        );

        service = TestBed.inject(NotificationService);
        const vm = await firstValueFrom(service.vm$);

        expect(vm.notifications).toEqual([historyOlder, invalidTimestampNotification]);
    });

    it('riusa la stessa pipeline vm con piu subscriber senza richiamare di nuovo lo storico', async () => {
        notificationApiStub.getNotificationsHistory.mockReturnValueOnce(of([historyOlder]));

        service = TestBed.inject(NotificationService);

        const [vmA, vmB] = await Promise.all([
            firstValueFrom(service.vm$),
            firstValueFrom(service.vm$),
        ]);

        expect(vmA).toEqual(vmB);
        expect(notificationApiStub.getNotificationsHistory).toHaveBeenCalledTimes(1);
    });

    it('mantiene uno snapshot coerente per subscriber tardivi senza ricaricare lo storico', async () => {
        notificationApiStub.getNotificationsHistory.mockReturnValueOnce(of([historyOlder]));

        service = TestBed.inject(NotificationService);

        const firstSubscription: Subscription = service.vm$.subscribe();
        await firstValueFrom(service.vm$);
        notificationsSubject.next([inSessionOnly]);

        // Simula unsubscribe temporaneo (es. cambio subtree template)
        firstSubscription.unsubscribe();

        const vmLateSubscriber = await firstValueFrom(service.vm$);
        expect(vmLateSubscriber.notifications).toEqual([inSessionOnly, historyOlder]);
        expect(notificationApiStub.getNotificationsHistory).toHaveBeenCalledTimes(1);
    });

    it('non muta gli array sorgente ricevuti da API e AlarmStateService', async () => {
        const historicList: NotificationEvent[] = [sharedHistoric, historyOlder];
        const inSessionList: NotificationEvent[] = [sharedInSession, inSessionOnly];

        notificationApiStub.getNotificationsHistory.mockReturnValueOnce(of(historicList));
        notificationsSubject.next(inSessionList);

        service = TestBed.inject(NotificationService);
        await firstValueFrom(service.vm$);

        expect(historicList).toEqual([sharedHistoric, historyOlder]);
        expect(inSessionList).toEqual([sharedInSession, inSessionOnly]);
    });

    it('deduplica anche duplicati interni alla stessa sorgente mantenendo l ultimo elemento', async () => {
        const duplicatedHistoryA: NotificationEvent = {
            notificationId: 'dup-history',
            title: 'Versione storica vecchia',
            sentAt: '2026-03-24T08:00:00.000Z',
        };
        const duplicatedHistoryB: NotificationEvent = {
            notificationId: 'dup-history',
            title: 'Versione storica nuova',
            sentAt: '2026-03-24T09:00:00.000Z',
        };
        const duplicatedSessionA: NotificationEvent = {
            notificationId: 'dup-session',
            title: 'Push vecchia',
            sentAt: '2026-03-24T10:00:00.000Z',
        };
        const duplicatedSessionB: NotificationEvent = {
            notificationId: 'dup-session',
            title: 'Push nuova',
            sentAt: '2026-03-24T11:00:00.000Z',
        };

        notificationApiStub.getNotificationsHistory.mockReturnValueOnce(
            of([duplicatedHistoryA, duplicatedHistoryB])
        );
        notificationsSubject.next([duplicatedSessionA, duplicatedSessionB]);

        service = TestBed.inject(NotificationService);
        const vm = await firstValueFrom(service.vm$);

        expect(vm.notifications).toEqual([duplicatedSessionB, duplicatedHistoryB]);
        expect(vm.notifications).toHaveLength(2);
    });

    it('mantiene coerenza: unreadCount segue lo stream dedicato anche quando la deduplica riduce la lista', async () => {
        notificationApiStub.getNotificationsHistory.mockReturnValueOnce(of([sharedHistoric]));
        notificationsSubject.next([sharedInSession]);
        unreadCountSubject.next(5);

        service = TestBed.inject(NotificationService);
        const vm = await firstValueFrom(service.vm$);

        expect(vm.notifications).toHaveLength(1);
        expect(vm.unreadCount).toBe(5);
    });
});