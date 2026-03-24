import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject, firstValueFrom, of, take, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';
import type { ActiveAlarm } from '../../../core/alarm/models/active-alarm.model';
import { AlarmApiService } from '../../../core/alarm/services/alarm-api.service';
import { AlarmStateService } from '../../../core/alarm/services/alarm-state.service';
import { AlarmManagementService } from './alarm-management.service';

describe('AlarmManagementService', () => {
    let service: AlarmManagementService;
    let activeAlarmsSubject: BehaviorSubject<ActiveAlarm[]>;

    const alarmStateStub = {
        getActiveAlarms$: vi.fn(),
        onAlarmResolved: vi.fn(),
    };

    const alarmApiStub = {
        resolveAlarm: vi.fn(),
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
        alarmStateStub.getActiveAlarms$.mockReturnValue(activeAlarmsSubject.asObservable());

        TestBed.configureTestingModule({
            providers: [
                AlarmManagementService,
                { provide: AlarmStateService, useValue: alarmStateStub },
                { provide: AlarmApiService, useValue: alarmApiStub },
            ],
        });

        service = TestBed.inject(AlarmManagementService);
    });

    it('espone vm iniziale con lista vuota e nessuna risoluzione in corso', async () => {
        const vm = await firstValueFrom(service.vm$);

        expect(vm).toEqual({
            alarms: [],
            isResolving: false,
            resolvingId: null,
            resolveError: null,
        });
    });

    it('resolveAlarm segue il flusso successo: resolving true, API call, update state, resolving false', async () => {
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
        alarmApiStub.resolveAlarm.mockReturnValue(throwError(() => new Error('timeout rete')));

        service.resolveAlarm('active-err');

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.isResolving).toBe(false);
        expect(vm.resolvingId).toBeNull();
        expect(vm.resolveError).toBe('timeout rete');
        expect(alarmStateStub.onAlarmResolved).not.toHaveBeenCalled();
    });

    it('consente richieste concorrenti e termina lo stato di resolving solo a completamento di tutte', async () => {
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
