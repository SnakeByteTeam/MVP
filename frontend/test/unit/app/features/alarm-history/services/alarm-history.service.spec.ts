import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, firstValueFrom, of, take, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActiveAlarm } from 'src/app/core/alarm/models/active-alarm.model';
import { AlarmPriority } from 'src/app/core/alarm/models/alarm-priority.enum';
import { UserRole } from 'src/app/core/models/user-role.enum';
import { InternalAuthService } from 'src/app/core/services/internal-auth.service';
import type { UserSession } from 'src/app/features/user-auth/models/user-session.model';
import { AlarmApiService } from 'src/app/core/alarm/services/alarm-api.service';
import { ApiErrorDisplayService } from 'src/app/core/services/api-error-display.service';
import { AlarmHistoryService } from 'src/app/features/alarm-history/services/alarm-history.service';

describe('AlarmHistoryService', () => {
    let service: AlarmHistoryService;
    let sessionSubject: BehaviorSubject<UserSession | null>;

    const alarmApiStub = {
        getResolvedAlarms: vi.fn(),
    };

    const authServiceStub = {
        getCurrentUser$: vi.fn(),
    };

    const apiErrorDisplayStub = {
        toMessage: vi.fn((err: unknown, options: { fallbackMessage: string }) => {
            if (err instanceof Error && err.message.trim().length > 0) return err.message;
            return options.fallbackMessage;
        }),
    };

    const alarmA: ActiveAlarm = {
        id: 'resolved-1',
        alarmRuleId: 'rule-1',
        alarmName: 'Antipanico',
        priority: AlarmPriority.RED,
        activationTime: '2026-03-24T10:00:00.000Z',
        resolutionTime: '2026-03-24T11:00:00.000Z',
        position: 'Camera 201',
        userId: 99,
        userUsername: 'operator1',
    };

    const alarmB: ActiveAlarm = {
        id: 'resolved-2',
        alarmRuleId: 'rule-2',
        alarmName: 'Porta aperta',
        priority: AlarmPriority.ORANGE,
        activationTime: '2026-03-24T10:01:00.000Z',
        resolutionTime: '2026-03-24T11:01:00.000Z',
        position: 'Corridoio Nord',
        userId: 7,
        userUsername: 'operator2',
    };

    beforeEach(() => {
        vi.clearAllMocks();

        sessionSubject = new BehaviorSubject<UserSession | null>({
            userId: '99',
            username: 'admin',
            role: UserRole.AMMINISTRATORE,
            accessToken: 'token',
            isFirstAccess: false,
        });

        authServiceStub.getCurrentUser$.mockReturnValue(sessionSubject.asObservable());
        alarmApiStub.getResolvedAlarms.mockReturnValue(of([]));

        TestBed.configureTestingModule({
            providers: [
                AlarmHistoryService,
                { provide: AlarmApiService, useValue: alarmApiStub },
                { provide: InternalAuthService, useValue: authServiceStub },
                { provide: ApiErrorDisplayService, useValue: apiErrorDisplayStub },
            ],
        });
    });

    const createService = (): AlarmHistoryService => TestBed.inject(AlarmHistoryService);

    it('espone vm iniziale corretto senza chiamare API', async () => {
        service = createService();
        const vm = await firstValueFrom(service.vm$.pipe(take(1)));

        expect(vm).toEqual({
            alarms: [],
            currentPage: 1,
            pageLimit: 6,
            pageOffset: 0,
            canGoPrevious: false,
            canGoNext: false,
        });

        expect(alarmApiStub.getResolvedAlarms).not.toHaveBeenCalled();
    });

    it('initialize carica la prima pagina con offset 0', () => {
        alarmApiStub.getResolvedAlarms.mockReturnValue(of([alarmA, alarmB]));

        service = createService();
        service.initialize();

        expect(alarmApiStub.getResolvedAlarms).toHaveBeenCalledWith(99, 7, 0);
    });

    it('initialize con lista vuota non imposta canGoNext', async () => {
        alarmApiStub.getResolvedAlarms.mockReturnValue(of([]));

        service = createService();
        service.initialize();

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.alarms.length).toBe(0);
        expect(vm.canGoNext).toBeFalsy();
    });

    it('initialize con pageLimit+1 elementi imposta canGoNext e fa lo slice', async () => {
        const alarms = Array.from({ length: 7 }, (_, i) => ({ ...alarmA, id: `resolved-${i}` }));
        alarmApiStub.getResolvedAlarms.mockReturnValue(of(alarms));

        service = createService();
        service.initialize();

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.canGoNext).toBeTruthy();
        expect(vm.alarms.length).toBe(6);
    });

    it('initialize con userId non numerico non chiama API', async () => {
        sessionSubject.next({
            userId: 'abc',
            username: 'admin',
            role: UserRole.AMMINISTRATORE,
            accessToken: 'token',
            isFirstAccess: false,
        });

        service = createService();
        service.initialize();

        expect(alarmApiStub.getResolvedAlarms).not.toHaveBeenCalled();
    });

    it('initialize non propaga eccezioni al chiamante', () => {
        alarmApiStub.getResolvedAlarms.mockReturnValue(throwError(() => new Error('errore rete')));

        service = createService();

        expect(() => service.initialize()).not.toThrow();
    });

    it('nextPage avanza alla pagina successiva', async () => {
        const firstPage = Array.from({ length: 7 }, (_, i) => ({ ...alarmA, id: `resolved-${i}` }));
        const secondPage = [{ ...alarmB, id: 'resolved-10' }];

        alarmApiStub.getResolvedAlarms
            .mockReturnValueOnce(of(firstPage))
            .mockReturnValueOnce(of(secondPage));

        service = createService();
        service.initialize();
        service.nextPage();

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.currentPage).toBe(2);
        expect(vm.pageOffset).toBe(6);
        expect(vm.canGoPrevious).toBeTruthy();
        expect(vm.alarms.map((a) => a.id)).toEqual(['resolved-10']);

        expect(alarmApiStub.getResolvedAlarms).toHaveBeenNthCalledWith(1, 99, 7, 0);
        expect(alarmApiStub.getResolvedAlarms).toHaveBeenNthCalledWith(2, 99, 7, 6);
    });

    it('nextPage non fa nulla se canGoNext è false', () => {
        alarmApiStub.getResolvedAlarms.mockReturnValue(of([alarmA]));

        service = createService();
        service.initialize();
        service.nextPage();

        expect(alarmApiStub.getResolvedAlarms).toHaveBeenCalledTimes(1);
    });

    it('pagina successiva con meno di pageLimit elementi imposta canGoNext a false', async () => {
        const firstPage = Array.from({ length: 7 }, (_, i) => ({ ...alarmA, id: `resolved-${i}` }));
        const secondPage = [{ ...alarmB, id: 'resolved-10' }, { ...alarmB, id: 'resolved-11' }];

        alarmApiStub.getResolvedAlarms
            .mockReturnValueOnce(of(firstPage))
            .mockReturnValueOnce(of(secondPage));

        service = createService();
        service.initialize();
        service.nextPage();

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.canGoNext).toBeFalsy();
        expect(vm.alarms.map((a) => a.id)).toEqual(['resolved-10', 'resolved-11']);
    });

    // --- previousPage ---

    it('previousPage torna alla pagina precedente', async () => {
        const firstPage = Array.from({ length: 7 }, (_, i) => ({ ...alarmA, id: `resolved-${i}` }));
        const secondPage = [{ ...alarmB, id: 'resolved-10' }];
        const firstPageAgain = Array.from({ length: 7 }, (_, i) => ({ ...alarmA, id: `resolved-${i}` }));

        alarmApiStub.getResolvedAlarms
            .mockReturnValueOnce(of(firstPage))
            .mockReturnValueOnce(of(secondPage))
            .mockReturnValueOnce(of(firstPageAgain));

        service = createService();
        service.initialize();
        service.nextPage();
        service.previousPage();

        const vm = await firstValueFrom(service.vm$.pipe(take(1)));
        expect(vm.currentPage).toBe(1);
        expect(vm.pageOffset).toBe(0);
        expect(vm.canGoPrevious).toBeFalsy();

        expect(alarmApiStub.getResolvedAlarms).toHaveBeenNthCalledWith(1, 99, 7, 0);
        expect(alarmApiStub.getResolvedAlarms).toHaveBeenNthCalledWith(2, 99, 7, 6);
        expect(alarmApiStub.getResolvedAlarms).toHaveBeenNthCalledWith(3, 99, 7, 0);
    });

    it('previousPage non fa nulla se l\'offset è già a zero', () => {
        alarmApiStub.getResolvedAlarms.mockReturnValue(of([alarmA]));

        service = createService();
        service.initialize();
        service.previousPage();

        expect(alarmApiStub.getResolvedAlarms).toHaveBeenCalledTimes(1);
    });
});