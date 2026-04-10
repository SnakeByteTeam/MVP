import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActiveAlarm } from 'src/app/core/alarm/models/active-alarm.model';
import { AlarmPriority } from 'src/app/core/alarm/models/alarm-priority.enum';
import { UserRole } from 'src/app/core/models/user-role.enum';
import { InternalAuthService } from 'src/app/core/services/internal-auth.service';
import { AlarmManagementRefreshService } from 'src/app/core/alarm/services/alarm-management-refresh.service';
import { Pipe, type PipeTransform } from '@angular/core';
import { ElapsedTimePipe } from 'src/app/shared/pipes/elapsed-time.pipe';
import type { UserSession } from 'src/app/features/user-auth/models/user-session.model';
import type { AlarmListVm } from 'src/app/features/alarm-management/models/alarm-list-vm.model';
import { AlarmManagementService } from 'src/app/features/alarm-management/services/alarm-management.service';
import { AlarmPageManagementComponent } from 'src/app/features/alarm-management/components/alarm-page-management-component/alarm-page-management-component';

@Pipe({
    name: 'elapsedTime',
    standalone: true,
})
class MockElapsedTimePipe implements PipeTransform {
    transform(value: string): string {
        return `mock-elapsed:${value}`;
    }
}

describe('AlarmManagement feature integration', () => {
    let fixture: ComponentFixture<AlarmPageManagementComponent>;
    let vmSubject: BehaviorSubject<AlarmListVm>;
    let userSessionSubject: BehaviorSubject<UserSession | null>;
    let refreshRequestedSubject: Subject<void>;

    const alarm1: ActiveAlarm = {
        id: 'active-1',
        alarmRuleId: 'rule-1',
        deviceId: 'device-1',
        alarmName: 'Antipanico',
        priority: AlarmPriority.RED,
        activationTime: '2026-03-24T10:00:00.000Z',
        resolutionTime: null,
        position: 'Camera 201',
        userId: 1,
        userUsername: 'oss_1',
    };

    const alarm2: ActiveAlarm = {
        id: 'active-2',
        alarmRuleId: 'rule-2',
        deviceId: 'device-2',
        alarmName: 'Porta aperta',
        priority: AlarmPriority.ORANGE,
        activationTime: '2026-03-24T10:01:00.000Z',
        resolutionTime: null,
        position: 'Corridoio Nord',
        userId: 2,
        userUsername: 'oss_2',
    };

    const alarmManagementStub = {
        vm$: undefined as unknown,
        initialize: vi.fn(),
        resolveAlarm: vi.fn(),
        nextPage: vi.fn(),
        previousPage: vi.fn(),
    };

    const authServiceStub = {
        getCurrentUser$: vi.fn(),
    };

    const refreshServiceStub = {
        getRefreshRequested$: vi.fn(),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        vmSubject = new BehaviorSubject<AlarmListVm>({
            alarms: [alarm1, alarm2],
            currentPage: 1,
            pageLimit: 6,
            pageOffset: 0,
            canGoPrevious: false,
            canGoNext: true,
            isResolving: false,
            resolvingId: null,
            resolveError: null,
        });

        alarmManagementStub.vm$ = vmSubject.asObservable();
        refreshRequestedSubject = new Subject<void>();
        refreshServiceStub.getRefreshRequested$.mockReturnValue(refreshRequestedSubject.asObservable());
        userSessionSubject = new BehaviorSubject<UserSession | null>({
            userId: '1',
            username: 'admin',
            role: UserRole.AMMINISTRATORE,
            accessToken: 'token',
            isFirstAccess: false,
        });
        authServiceStub.getCurrentUser$.mockReturnValue(userSessionSubject.asObservable());

        TestBed.overrideComponent(AlarmPageManagementComponent, {
            remove: { imports: [ElapsedTimePipe] },
            add: { imports: [MockElapsedTimePipe] },
        });

        await TestBed.configureTestingModule({
            imports: [AlarmPageManagementComponent],
            providers: [
                { provide: AlarmManagementService, useValue: alarmManagementStub },
                { provide: InternalAuthService, useValue: authServiceStub },
                { provide: AlarmManagementRefreshService, useValue: refreshServiceStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AlarmPageManagementComponent);
    });

    it('gestisce il flusso completo: render lista, resolve event e aggiornamento vm', () => {
        fixture.detectChanges();

        expect(alarmManagementStub.initialize).toHaveBeenCalledTimes(1);

        let nativeElement = fixture.nativeElement as HTMLElement;
        let resolveButtons = nativeElement.querySelectorAll('button[aria-label^="Gestisci allarme"]');

        expect(resolveButtons.length).toBe(2);
        expect(nativeElement.textContent).toContain('Allarmi attivi');
        expect(nativeElement.textContent).toContain('mock-elapsed:2026-03-24T10:00:00.000Z');

        resolveButtons[0].dispatchEvent(new MouseEvent('click'));
        expect(alarmManagementStub.resolveAlarm).toHaveBeenCalledWith('active-1');
        expect(alarmManagementStub.resolveAlarm).toHaveBeenCalledTimes(1);

        vmSubject.next({
            alarms: [alarm1, alarm2],
            currentPage: 1,
            pageLimit: 6,
            pageOffset: 0,
            canGoPrevious: false,
            canGoNext: true,
            isResolving: true,
            resolvingId: 'active-1',
            resolveError: null,
        });
        fixture.detectChanges();

        resolveButtons = (fixture.nativeElement as HTMLElement).querySelectorAll('button[aria-label^="Gestisci allarme"]');

        expect((resolveButtons.item(0) as HTMLButtonElement).disabled).toBe(true);
        expect((resolveButtons.item(1) as HTMLButtonElement).disabled).toBe(false);
        expect((fixture.nativeElement as HTMLElement).querySelector('.alarm-management__status')?.textContent).toContain(
            'Risoluzione allarme in corso...'
        );

        vmSubject.next({
            alarms: [
                {
                    ...alarm1,
                    resolutionTime: '2026-03-24T10:05:00.000Z',
                    userId: 99,
                },
                alarm2,
            ],
            currentPage: 1,
            pageLimit: 6,
            pageOffset: 0,
            canGoPrevious: false,
            canGoNext: true,
            isResolving: false,
            resolvingId: null,
            resolveError: null,
        });
        fixture.detectChanges();

        nativeElement = fixture.nativeElement as HTMLElement;
        resolveButtons = nativeElement.querySelectorAll('button[aria-label^="Gestisci allarme"]');

        const managedButton = nativeElement.querySelector('button[aria-label="Allarme gia gestito Antipanico"]');
        expect(resolveButtons.length).toBe(1);
        expect(managedButton).not.toBeNull();
        expect((managedButton as HTMLButtonElement).disabled).toBe(true);
        expect(nativeElement.textContent).toContain('Non da gestire');
    });

    it('riesegue initialize quando arriva una richiesta di refresh esterna', () => {
        fixture.detectChanges();
        expect(alarmManagementStub.initialize).toHaveBeenCalledTimes(1);

        refreshRequestedSubject.next();

        expect(alarmManagementStub.initialize).toHaveBeenCalledTimes(2);
    });
});
