import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject, firstValueFrom, of, take, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActiveAlarm } from '../../../core/alarm/models/active-alarm.model';
import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';
import { UserRole } from '../../../core/models/user-role.enum';
import { InternalAuthService } from '../../../core/services/internal-auth.service';
import type { UserSession } from '../../user-auth/models/user-session.model';
import { AlarmApiService } from '../../../core/alarm/services/alarm-api.service';
import { AlarmStateService } from '../../../core/alarm/services/alarm-state.service';
import { AlarmManagementService } from './alarm-management.service';

describe('AlarmManagementService', () => {
    let service: AlarmManagementService;
    let activeAlarmsSubject: BehaviorSubject<ActiveAlarm[]>;
    let sessionSubject: BehaviorSubject<UserSession | null>;

    const alarmStateStub = {
        getActiveAlarms$: vi.fn(),
        setActiveAlarms: vi.fn(),
        onAlarmResolved: vi.fn(),
    };

    const alarmApiStub = {
        getActiveAlarms: vi.fn(),
        resolveAlarm: vi.fn(),
    };

    const authServiceStub = {
        getCurrentUser$: vi.fn(),
    };

    const alarmA: ActiveAlarm = {
        id: 'active-1',
        alarmRuleId: 'rule-1',
        alarmName: 'Antipanico',
        priority: AlarmPriority.RED,
        activationTime: '2026-03-24T10:00:00.000Z',
        resolutionTime: null,
        position: 'Camera 201',
        userId: 99,
    };

    const alarmB: ActiveAlarm = {
        id: 'active-2',
        alarmRuleId: 'rule-2',
        alarmName: 'Porta aperta',
        priority: AlarmPriority.ORANGE,
        activationTime: '2026-03-24T10:01:00.000Z',
        resolutionTime: null,
        position: 'Corridoio Nord',
        userId: 7,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        activeAlarmsSubject = new BehaviorSubject<ActiveAlarm[]>([]);
        sessionSubject = new BehaviorSubject<UserSession | null>({
            userId: '99',
            username: 'admin',
            role: UserRole.AMMINISTRATORE,
            accessToken: 'token',
            isFirstAccess: false,
        });

        alarmStateStub.getActiveAlarms$.mockReturnValue(activeAlarmsSubject.asObservable());
        alarmStateStub.setActiveAlarms.mockImplementation((alarms: ActiveAlarm[]) => {
            activeAlarmsSubject.next(alarms);
        });
        alarmStateStub.onAlarmResolved.mockImplementation((resolvedId: string) => {
            const next = activeAlarmsSubject
                .getValue()
                .filter((alarm) => alarm.id !== resolvedId);

            activeAlarmsSubject.next(next);
        });
        alarmApiStub.getActiveAlarms.mockReturnValue(of([]));
        authServiceStub.getCurrentUser$.mockReturnValue(sessionSubject.asObservable());

        TestBed.configureTestingModule({
            providers: [
                AlarmManagementService,
                { provide: AlarmStateService, useValue: alarmStateStub },
                { provide: AlarmApiService, useValue: alarmApiStub },
                { provide: InternalAuthService, useValue: authServiceStub },
            ],
        });
    });

    const createService = (): AlarmManagementService => TestBed.inject(AlarmManagementService);

    it('non carica lo snapshot iniziale automaticamente alla creazione', () => {
        service = createService();

        expect(alarmApiStub.getActiveAlarms).not.toHaveBeenCalled();
        expect(alarmStateStub.setActiveAlarms).not.toHaveBeenCalled();
    });

    it('initialize per amministratore mostra tutti gli allarmi senza filtri frontend', () => {
        const initialSnapshot: ActiveAlarm[] = [alarmA, alarmB];
        alarmApiStub.getActiveAlarms.mockReturnValueOnce(of(initialSnapshot));

        service = createService();
        service.initialize();

        expect(alarmApiStub.getActiveAlarms).toHaveBeenCalledTimes(2);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenCalledWith(99, 6, 0);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(2, 99, 6, 6);
        expect(alarmStateStub.setActiveAlarms).toHaveBeenCalledWith(initialSnapshot, 'replace');
    });

    it('initialize per OSS usa endpoint unmanaged con userId numerico', () => {
        sessionSubject.next({
            userId: '7',
            username: 'oss',
            role: UserRole.OPERATORE_SANITARIO,
            accessToken: 'token',
            isFirstAccess: false,
        });

        const initialSnapshot: ActiveAlarm[] = [alarmA, alarmB];
        alarmApiStub.getActiveAlarms.mockReturnValueOnce(of(initialSnapshot));

        service = createService();
        service.initialize();

        expect(alarmApiStub.getActiveAlarms).toHaveBeenCalledTimes(2);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenCalledWith(7, 6, 0);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(2, 7, 6, 6);
        expect(alarmStateStub.setActiveAlarms).toHaveBeenCalledWith(initialSnapshot, 'replace');
    });

    it('se initialize fallisce non propaga eccezioni e valorizza l errore nel vm', async () => {
        alarmApiStub.getActiveAlarms.mockReturnValueOnce(throwError(() => new Error('bootstrap error')));

        service = createService();

        expect(() => service.initialize()).not.toThrow();
        expect(alarmStateStub.setActiveAlarms).not.toHaveBeenCalled();

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.resolveError).toBe('bootstrap error');
    });

    it('espone vm iniziale senza campi scope e nessuna risoluzione in corso', async () => {
        service = createService();
        const vm = await firstValueFrom(service.vm$.pipe(take(1)));

        expect(vm).toEqual({
            alarms: [],
            currentPage: 1,
            pageOffset: 0,
            canGoPrevious: false,
            canGoNext: false,
            isResolving: false,
            resolvingId: null,
            resolveError: null,
        });
    });

    it('resolveAlarm segue il flusso successo: resolving true, API call, update state, resolving false', async () => {
        service = createService();
        activeAlarmsSubject.next([alarmA, alarmB]);
        const resolveRequest$ = new Subject<void>();
        alarmApiStub.resolveAlarm.mockReturnValue(resolveRequest$.asObservable());

        service.resolveAlarm(alarmA.id);

        let vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.isResolving).toBe(true);
        expect(vm.resolvingId).toBe(alarmA.id);
        expect(vm.resolveError).toBeNull();

        resolveRequest$.next();
        resolveRequest$.complete();

        vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.isResolving).toBe(false);
        expect(vm.resolvingId).toBeNull();
        expect(vm.resolveError).toBeNull();

        expect(alarmApiStub.resolveAlarm).toHaveBeenCalledWith(alarmA.id, 99);
        expect(alarmStateStub.onAlarmResolved).toHaveBeenCalledWith(alarmA.id);
        expect(alarmStateStub.onAlarmResolved).toHaveBeenCalledTimes(1);
    });

    it('prima della resolve il vm riflette solo AlarmStateService', async () => {
        service = createService();
        const vmHistory: ActiveAlarm[][] = [];
        const subscription = service.vm$.subscribe((vm) => {
            vmHistory.push(vm.alarms);
        });

        activeAlarmsSubject.next([alarmA]);
        activeAlarmsSubject.next([alarmB]);

        const latestVm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(latestVm.alarms).toEqual([alarmB]);
        expect(vmHistory.at(-1)).toEqual([alarmB]);

        subscription.unsubscribe();
    });

    it('dopo resolve non mantiene righe locali e riallinea lo stato allo snapshot backend', async () => {
        service = createService();
        activeAlarmsSubject.next([alarmA, alarmB]);
        alarmApiStub.resolveAlarm.mockReturnValueOnce(of(void 0));

        service.resolveAlarm(alarmA.id);

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));

        expect(vm.alarms).toEqual([]);
        expect(alarmStateStub.setActiveAlarms).toHaveBeenCalledWith([], 'replace');
    });

    it('dopo resolve ricarica la pagina corrente dal backend', async () => {
        service = createService();
        alarmApiStub.getActiveAlarms.mockReturnValueOnce(of([alarmA]));
        activeAlarmsSubject.next([alarmA]);
        alarmApiStub.resolveAlarm.mockReturnValueOnce(of(void 0));

        service.resolveAlarm(alarmA.id);

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));

        expect(vm.alarms.length).toBe(1);
        expect(vm.alarms[0].id).toBe(alarmA.id);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(1, 99, 6, 0);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(2, 99, 6, 6);
        expect(alarmStateStub.setActiveAlarms).toHaveBeenCalledWith([alarmA], 'replace');
    });

    it('dopo resolve su pagina non iniziale vuota torna automaticamente alla pagina precedente', async () => {
        const firstPage: ActiveAlarm[] = [
            alarmA,
            alarmB,
            { ...alarmA, id: 'active-3' },
            { ...alarmA, id: 'active-4' },
            { ...alarmA, id: 'active-5' },
            { ...alarmA, id: 'active-6' },
        ];
        const secondPage: ActiveAlarm[] = [{ ...alarmA, id: 'active-7' }];

        alarmApiStub.getActiveAlarms
            .mockReturnValueOnce(of(firstPage))
            .mockReturnValueOnce(of(secondPage))
            .mockReturnValueOnce(of(secondPage))
            .mockReturnValueOnce(of([]))
            .mockReturnValueOnce(of([]))
            .mockReturnValueOnce(of(firstPage))
            .mockReturnValueOnce(of([]));
        alarmApiStub.resolveAlarm.mockReturnValueOnce(of(void 0));

        service = createService();
        service.initialize();
        service.nextPage();
        service.resolveAlarm('active-7');

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));

        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(1, 99, 6, 0);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(2, 99, 6, 6);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(3, 99, 6, 6);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(4, 99, 6, 12);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(5, 99, 6, 6);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(6, 99, 6, 0);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(7, 99, 6, 6);
        expect(vm.currentPage).toBe(1);
        expect(vm.pageOffset).toBe(0);
        expect(vm.canGoNext).toBe(false);
        expect(vm.alarms.map((alarm) => alarm.id)).toEqual([
            'active-1',
            'active-2',
            'active-3',
            'active-4',
            'active-5',
            'active-6',
        ]);
    });

    it('nextPage usa limit 6 e incrementa offset quando la pagina corrente e piena', async () => {
        const firstPage: ActiveAlarm[] = [
            alarmA,
            alarmB,
            { ...alarmA, id: 'active-3' },
            { ...alarmA, id: 'active-4' },
            { ...alarmA, id: 'active-5' },
            { ...alarmA, id: 'active-6' },
        ];
        const secondPage: ActiveAlarm[] = [{ ...alarmA, id: 'active-7' }];

        alarmApiStub.getActiveAlarms
            .mockReturnValueOnce(of(firstPage))
            .mockReturnValueOnce(of(secondPage))
            .mockReturnValueOnce(of(secondPage))
            .mockReturnValueOnce(of([]));

        service = createService();
        service.initialize();
        service.nextPage();

        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(1, 99, 6, 0);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(2, 99, 6, 6);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(3, 99, 6, 6);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(4, 99, 6, 12);

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.currentPage).toBe(2);
        expect(vm.pageOffset).toBe(6);
        expect(vm.canGoPrevious).toBe(true);
        expect(vm.alarms.map((alarm) => alarm.id)).toEqual(['active-7']);
    });

    it('nextPage non fa nulla quando canGoNext e false', async () => {
        alarmApiStub.getActiveAlarms.mockReturnValueOnce(of([alarmA]));

        service = createService();
        service.initialize();
        service.nextPage();

        expect(alarmApiStub.getActiveAlarms).toHaveBeenCalledTimes(2);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(1, 99, 6, 0);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(2, 99, 6, 6);

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.currentPage).toBe(1);
        expect(vm.pageOffset).toBe(0);
        expect(vm.canGoNext).toBe(false);
    });

    it('la pagina successiva con meno di 6 elementi imposta canGoNext a false', async () => {
        const firstPage: ActiveAlarm[] = [
            alarmA,
            alarmB,
            { ...alarmA, id: 'active-3' },
            { ...alarmA, id: 'active-4' },
            { ...alarmA, id: 'active-5' },
            { ...alarmA, id: 'active-6' },
        ];

        alarmApiStub.getActiveAlarms
            .mockReturnValueOnce(of(firstPage))
            .mockReturnValueOnce(of([{ ...alarmA, id: 'active-7' }, { ...alarmA, id: 'active-8' }]))
            .mockReturnValueOnce(of([{ ...alarmA, id: 'active-7' }, { ...alarmA, id: 'active-8' }]))
            .mockReturnValueOnce(of([]));

        service = createService();
        service.initialize();
        service.nextPage();

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.currentPage).toBe(2);
        expect(vm.canGoNext).toBe(false);
        expect(vm.alarms.map((alarm) => alarm.id)).toEqual(['active-7', 'active-8']);
    });

    it('previousPage decrementa l offset fino a 0', async () => {
        const firstPage: ActiveAlarm[] = [
            alarmA,
            alarmB,
            { ...alarmA, id: 'active-3' },
            { ...alarmA, id: 'active-4' },
            { ...alarmA, id: 'active-5' },
            { ...alarmA, id: 'active-6' },
        ];
        const secondPage: ActiveAlarm[] = [{ ...alarmA, id: 'active-7' }];

        alarmApiStub.getActiveAlarms
            .mockReturnValueOnce(of(firstPage))
            .mockReturnValueOnce(of(secondPage))
            .mockReturnValueOnce(of(secondPage))
            .mockReturnValueOnce(of([]))
            .mockReturnValueOnce(of(firstPage))
            .mockReturnValueOnce(of(secondPage));

        service = createService();
        service.initialize();
        service.nextPage();
        service.previousPage();

        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(1, 99, 6, 0);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(2, 99, 6, 6);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(3, 99, 6, 6);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(4, 99, 6, 12);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(5, 99, 6, 0);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(6, 99, 6, 6);

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.currentPage).toBe(1);
        expect(vm.pageOffset).toBe(0);
        expect(vm.canGoPrevious).toBe(false);
    });

    it('previousPage non fa nulla se l offset e gia a zero', () => {
        alarmApiStub.getActiveAlarms.mockReturnValueOnce(of([alarmA]));

        service = createService();
        service.initialize();
        service.previousPage();

        expect(alarmApiStub.getActiveAlarms).toHaveBeenCalledTimes(2);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(1, 99, 6, 0);
        expect(alarmApiStub.getActiveAlarms).toHaveBeenNthCalledWith(2, 99, 6, 6);
    });

    it('in errore resetta resolving e valorizza resolveError nel vm', async () => {
        service = createService();
        alarmApiStub.resolveAlarm.mockReturnValue(throwError(() => new Error('timeout rete')));

        service.resolveAlarm('active-err');

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.isResolving).toBe(false);
        expect(vm.resolvingId).toBeNull();
        expect(vm.resolveError).toBe('timeout rete');
        expect(alarmStateStub.onAlarmResolved).not.toHaveBeenCalled();
    });

    it('resolveAlarm con userId non numerico non chiama API e valorizza errore esplicito', async () => {
        sessionSubject.next({
            userId: 'abc',
            username: 'admin',
            role: UserRole.AMMINISTRATORE,
            accessToken: 'token',
            isFirstAccess: false,
        });

        service = createService();
        activeAlarmsSubject.next([alarmA]);

        service.resolveAlarm(alarmA.id);

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.isResolving).toBe(false);
        expect(vm.resolvingId).toBeNull();
        expect(vm.resolveError).toBe("Utente corrente non valido per risolvere l'allarme.");
        expect(alarmApiStub.resolveAlarm).not.toHaveBeenCalled();
        expect(alarmStateStub.onAlarmResolved).not.toHaveBeenCalled();
    });

    it('initialize con errore non strutturato usa fallback di caricamento', async () => {
        alarmApiStub.getActiveAlarms.mockReturnValueOnce(throwError(() => ({ cause: 'unknown' })));

        service = createService();
        service.initialize();

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.resolveError).toBe('Errore durante il caricamento degli allarmi attivi.');
    });

    it('initialize con userId non numerico non chiama API e valorizza errore esplicito', async () => {
        sessionSubject.next({
            userId: 'abc',
            username: 'oss',
            role: UserRole.OPERATORE_SANITARIO,
            accessToken: 'token',
            isFirstAccess: false,
        });

        service = createService();
        service.initialize();

        expect(alarmApiStub.getActiveAlarms).not.toHaveBeenCalled();
        expect(alarmStateStub.setActiveAlarms).not.toHaveBeenCalled();

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.resolveError).toBe('Utente corrente non valido per caricare gli allarmi attivi.');
    });

    it('consente richieste concorrenti e termina resolving solo a completamento di tutte', async () => {
        service = createService();
        const reqA$ = new Subject<void>();
        const reqB$ = new Subject<void>();

        alarmApiStub.resolveAlarm
            .mockReturnValueOnce(reqA$.asObservable())
            .mockReturnValueOnce(reqB$.asObservable());

        service.resolveAlarm('active-1');
        service.resolveAlarm('active-2');

        let vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.isResolving).toBe(true);
        expect(vm.resolvingId).toBe('active-2');

        reqA$.next();
        reqA$.complete();

        vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.isResolving).toBe(true);

        reqB$.next();
        reqB$.complete();

        vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.isResolving).toBe(false);
        expect(vm.resolvingId).toBeNull();
    });

    it('resetta eventuale errore precedente quando parte una nuova resolveAlarm', async () => {
        service = createService();
        alarmApiStub.resolveAlarm.mockReturnValueOnce(throwError(() => new Error('errore precedente')));

        service.resolveAlarm('active-x');

        let vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.resolveError).toBe('errore precedente');

        alarmApiStub.resolveAlarm.mockReturnValueOnce(of(void 0));
        service.resolveAlarm('active-y');

        vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.resolveError).toBeNull();
    });
});
