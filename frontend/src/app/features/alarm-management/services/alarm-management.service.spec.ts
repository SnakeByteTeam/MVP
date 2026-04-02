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
        getActiveAlarmsOfOperator: vi.fn(),
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
    };

    const alarmB: ActiveAlarm = {
        id: 'active-2',
        alarmRuleId: 'rule-2',
        alarmName: 'Porta aperta',
        priority: AlarmPriority.ORANGE,
        activationTime: '2026-03-24T10:01:00.000Z',
        resolutionTime: null,
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
        alarmApiStub.getActiveAlarms.mockReturnValue(of([]));
        alarmApiStub.getActiveAlarmsOfOperator.mockReturnValue(of([]));
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
        expect(alarmApiStub.getActiveAlarmsOfOperator).not.toHaveBeenCalled();
        expect(alarmStateStub.setActiveAlarms).not.toHaveBeenCalled();
    });

    it('initialize per amministratore carica gli allarmi attivi globali', () => {
        const initialSnapshot: ActiveAlarm[] = [alarmA, alarmB];
        alarmApiStub.getActiveAlarms.mockReturnValueOnce(of(initialSnapshot));

        service = createService();
        service.initialize();

        expect(alarmApiStub.getActiveAlarms).toHaveBeenCalledTimes(1);
        expect(alarmApiStub.getActiveAlarmsOfOperator).not.toHaveBeenCalled();
        expect(alarmStateStub.setActiveAlarms).toHaveBeenCalledWith(initialSnapshot);
    });

    it('initialize per OSS usa endpoint dedicato con userId', () => {
        sessionSubject.next({
            userId: '7',
            username: 'oss',
            role: UserRole.OPERATORE_SANITARIO,
            accessToken: 'token',
            isFirstAccess: false,
        });

        const initialSnapshot: ActiveAlarm[] = [alarmA];
        alarmApiStub.getActiveAlarmsOfOperator.mockReturnValueOnce(of(initialSnapshot));

        service = createService();
        service.initialize();

        expect(alarmApiStub.getActiveAlarmsOfOperator).toHaveBeenCalledWith('7');
        expect(alarmApiStub.getActiveAlarms).not.toHaveBeenCalled();
        expect(alarmStateStub.setActiveAlarms).toHaveBeenCalledWith(initialSnapshot);
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

    it('non mantiene copia locale degli allarmi: vm riflette solo AlarmStateService', async () => {
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
