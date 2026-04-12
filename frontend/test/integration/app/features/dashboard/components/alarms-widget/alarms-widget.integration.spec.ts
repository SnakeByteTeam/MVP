import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmPriority } from 'src/app/core/alarm/models/alarm-priority.enum';
import { AlarmManagementRefreshService } from 'src/app/core/alarm/services/alarm-management-refresh.service';
import { AlarmListVm } from 'src/app/features/alarm-management/models/alarm-list-vm.model';
import { AlarmManagementService } from 'src/app/features/alarm-management/services/alarm-management.service';
import { AlarmWidgetComponent } from 'src/app/features/dashboard/components/alarms-widget/alarms-widget.component';

describe('AlarmWidget feature integration', () => {
    let fixture: ComponentFixture<AlarmWidgetComponent>;
    let component: AlarmWidgetComponent;
    let vmSubject: BehaviorSubject<AlarmListVm>;
    let refreshSubject: BehaviorSubject<void>;

    const alarmManagementStub = {
        vm$: undefined as unknown,
        initialize: vi.fn(),
        resolveAlarm: vi.fn(),
    };

    const refreshStub = {
        getRefreshRequested$: vi.fn(),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        vmSubject = new BehaviorSubject<AlarmListVm>({
            alarms: [
                {
                    id: 'a-1',
                    alarmRuleId: 'rule-1',
                    alarmName: 'Antipanico',
                    priority: AlarmPriority.RED,
                    activationTime: '2026-04-11T10:00:00.000Z',
                    resolutionTime: null,
                    position: 'Camera 1',
                    userId: null,
                },
            ],
            currentPage: 1,
            pageLimit: 6,
            pageOffset: 0,
            canGoPrevious: false,
            canGoNext: false,
            isResolving: false,
            resolvingId: null,
            resolveError: null,
        });
        refreshSubject = new BehaviorSubject<void>(void 0);

        alarmManagementStub.vm$ = vmSubject.asObservable();
        refreshStub.getRefreshRequested$.mockReturnValue(refreshSubject.asObservable());

        await TestBed.configureTestingModule({
            imports: [AlarmWidgetComponent],
            providers: [
                { provide: AlarmManagementService, useValue: alarmManagementStub },
                { provide: AlarmManagementRefreshService, useValue: refreshStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AlarmWidgetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('RF44-OBL init widget invoca initialize service', () => {
        expect(component).toBeTruthy();
        expect(alarmManagementStub.initialize).toHaveBeenCalled();
    });

    it('RF44-OBL click azione allarme delega resolveAlarm', () => {
        const actionButton = fixture.nativeElement.querySelector('button[aria-label^="Gestisci allarme"]');
        actionButton?.dispatchEvent(new MouseEvent('click'));

        expect(alarmManagementStub.resolveAlarm).toHaveBeenCalledWith('a-1');
    });

    it('RF44-OBL refresh esterno reinizializza la tabella', () => {
        const callsBefore = alarmManagementStub.initialize.mock.calls.length;

        refreshSubject.next();

        expect(alarmManagementStub.initialize.mock.calls.length).toBeGreaterThan(callsBefore);
    });
});
