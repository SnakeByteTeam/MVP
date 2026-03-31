import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject, filter, firstValueFrom, of, take, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActiveAlarm } from '../../../core/alarm/models/active-alarm.model';
import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';
import type { AlarmRule } from '../../../core/alarm/models/alarm-rule.model';
import { ThresholdOperator } from '../../../core/alarm/models/threshold-operator.enum';
import { AlarmApiService } from '../../../core/alarm/services/alarm-api.service';
import { AlarmStateService } from '../../../core/alarm/services/alarm-state.service';
import { AlarmRuleLookupService } from './alarm-rule-lookup.service';
import { AlarmManagementService } from './alarm-management.service';
import { OperatorAlarmScopeContext, OperatorAlarmScopeService } from './operator-alarm-scope.service';

describe('AlarmManagementService', () => {
    let service: AlarmManagementService;
    let activeAlarmsSubject: BehaviorSubject<ActiveAlarm[]>;
    let scopeContextSubject: BehaviorSubject<OperatorAlarmScopeContext>;

    const alarmStateStub = {
        getActiveAlarms$: vi.fn(),
        setActiveAlarms: vi.fn(),
        onAlarmResolved: vi.fn(),
    };

    const alarmApiStub = {
        getActiveAlarms: vi.fn(),
        resolveAlarm: vi.fn(),
    };

    const operatorScopeStub = {
        context$: undefined as unknown,
    };

    const alarmRuleLookupStub = {
        getAlarmRuleById: vi.fn(),
    };

    const alarmA: ActiveAlarm = {
        id: 'active-1',
        alarmRuleId: 'rule-1',
        alarmName: 'Antipanico',
        priority: AlarmPriority.RED,
        triggeredAt: '2026-03-24T10:00:00.000Z',
        resolvedAt: null,
        user_id: null,
    };

    const alarmB: ActiveAlarm = {
        id: 'active-2',
        alarmRuleId: 'rule-2',
        alarmName: 'Porta aperta',
        priority: AlarmPriority.ORANGE,
        triggeredAt: '2026-03-24T10:01:00.000Z',
        resolvedAt: null,
        user_id: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        activeAlarmsSubject = new BehaviorSubject<ActiveAlarm[]>([]);
        scopeContextSubject = new BehaviorSubject<OperatorAlarmScopeContext>({
            isOperator: false,
            assignedWardIds: [],
            assignedPlantIds: [],
            errorMessage: null,
        });

        alarmStateStub.getActiveAlarms$.mockReturnValue(activeAlarmsSubject.asObservable());
        alarmApiStub.getActiveAlarms.mockReturnValue(of([]));
        operatorScopeStub.context$ = scopeContextSubject.asObservable();
        alarmRuleLookupStub.getAlarmRuleById.mockReturnValue(of(null));

        TestBed.configureTestingModule({
            providers: [
                AlarmManagementService,
                { provide: AlarmStateService, useValue: alarmStateStub },
                { provide: AlarmApiService, useValue: alarmApiStub },
                { provide: OperatorAlarmScopeService, useValue: operatorScopeStub },
                { provide: AlarmRuleLookupService, useValue: alarmRuleLookupStub },
            ],
        });
    });

    const createService = (): AlarmManagementService => TestBed.inject(AlarmManagementService);

    const createAlarmRule = (id: string, apartmentId: string): AlarmRule => ({
        id,
        name: `Rule ${id}`,
        apartmentId,
        deviceId: `device-${id}`,
        priority: AlarmPriority.RED,
        thresholdOperator: ThresholdOperator.GREATER_THAN,
        threshold: 10,
        activationTime: '08:00',
        deactivationTime: '20:00',
        enabled: true,
    });

    it('non carica lo snapshot iniziale automaticamente alla creazione', () => {
        service = createService();

        expect(alarmApiStub.getActiveAlarms).not.toHaveBeenCalled();
        expect(alarmStateStub.setActiveAlarms).not.toHaveBeenCalled();
    });

    it('initialize carica gli allarmi attivi iniziali via API e idrata AlarmStateService', () => {
        const initialSnapshot: ActiveAlarm[] = [alarmA, alarmB];
        alarmApiStub.getActiveAlarms.mockReturnValueOnce(of(initialSnapshot));

        service = createService();
        service.initialize();

        expect(alarmApiStub.getActiveAlarms).toHaveBeenCalledTimes(1);
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

    it('espone vm iniziale con scope all e nessuna risoluzione in corso', async () => {
        service = createService();
        const vm = await firstValueFrom(service.vm$);

        expect(vm).toEqual({
            alarms: [],
            isResolving: false,
            resolvingId: null,
            resolveError: null,
            activeScope: 'all',
            availableScopes: ['all'],
            scopeInfoMessage: null,
            scopeLoading: false,
        });
    });

    it('espone scope all e mine per operatore sanitario', async () => {
        scopeContextSubject.next({
            isOperator: true,
            assignedWardIds: [1],
            assignedPlantIds: ['apt-1'],
            errorMessage: null,
        });

        service = createService();
        const vm = await firstValueFrom(service.vm$.pipe(take(1)));

        expect(vm.availableScopes).toEqual(['all', 'mine']);
        expect(vm.activeScope).toBe('all');
    });

    it('switchScope su mine filtra gli allarmi per reparti assegnati', async () => {
        scopeContextSubject.next({
            isOperator: true,
            assignedWardIds: [1],
            assignedPlantIds: ['apt-1'],
            errorMessage: null,
        });

        alarmRuleLookupStub.getAlarmRuleById.mockImplementation((alarmRuleId: string) => {
            if (alarmRuleId === 'rule-1') {
                return of(createAlarmRule('rule-1', 'apt-1'));
            }

            return of(createAlarmRule('rule-2', 'apt-2'));
        });

        service = createService();
        activeAlarmsSubject.next([alarmA, alarmB]);

        service.switchScope('mine');

        const vm = await firstValueFrom(service.vm$.pipe(filter((candidate) => !candidate.scopeLoading), take(1)));
        expect(vm.activeScope).toBe('mine');
        expect(vm.alarms).toEqual([alarmA]);
        expect(alarmRuleLookupStub.getAlarmRuleById).toHaveBeenCalledWith('rule-1');
        expect(alarmRuleLookupStub.getAlarmRuleById).toHaveBeenCalledWith('rule-2');
    });

    it('scope mine mostra lista vuota e messaggio quando l operatore non ha reparti assegnati', async () => {
        scopeContextSubject.next({
            isOperator: true,
            assignedWardIds: [],
            assignedPlantIds: [],
            errorMessage: null,
        });

        service = createService();
        activeAlarmsSubject.next([alarmA]);
        service.switchScope('mine');

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.activeScope).toBe('mine');
        expect(vm.alarms).toEqual([]);
        expect(vm.scopeInfoMessage).toBe('Non hai reparti assegnati.');
        expect(vm.scopeLoading).toBe(false);
    });

    it('resolveAlarm segue il flusso successo: resolving true, API call, update state, resolving false', async () => {
        service = createService();
        activeAlarmsSubject.next([alarmA, alarmB]);
        const resolveRequest$ = new Subject<void>();
        alarmApiStub.resolveAlarm.mockReturnValue(resolveRequest$.asObservable());

        const emissions: Array<{
            alarms: ActiveAlarm[];
            isResolving: boolean;
            resolvingId: string | null;
            resolveError: string | null;
        }> = [];

        const subscription = service.vm$.subscribe((vm) => {
            emissions.push(vm);
        });

        service.resolveAlarm(alarmA.id);

        const duringResolve = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(duringResolve.isResolving).toBe(true);
        expect(duringResolve.resolvingId).toBe(alarmA.id);
        expect(duringResolve.resolveError).toBeNull();

        resolveRequest$.next();
        resolveRequest$.complete();

        const afterResolve = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(afterResolve.isResolving).toBe(false);
        expect(afterResolve.resolvingId).toBeNull();
        expect(afterResolve.resolveError).toBeNull();

        expect(alarmApiStub.resolveAlarm).toHaveBeenCalledWith(alarmA.id);
        expect(alarmStateStub.onAlarmResolved).toHaveBeenCalledWith(alarmA.id);
        expect(alarmStateStub.onAlarmResolved).toHaveBeenCalledTimes(1);
        expect(emissions.length).toBeGreaterThanOrEqual(3);

        subscription.unsubscribe();
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
