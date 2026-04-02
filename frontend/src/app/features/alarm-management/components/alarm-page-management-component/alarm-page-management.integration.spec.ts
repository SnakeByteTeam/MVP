import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActiveAlarm } from '../../../../core/alarm/models/active-alarm.model';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import type { AlarmListVm } from '../../models/alarm-list-vm.model';
import { AlarmManagementService } from '../../services/alarm-management.service';
import { AlarmPageManagementComponent } from './alarm-page-management-component';

describe('AlarmManagement feature integration', () => {
    let fixture: ComponentFixture<AlarmPageManagementComponent>;
    let vmSubject: BehaviorSubject<AlarmListVm>;

    const alarm1: ActiveAlarm = {
        id: 'active-1',
        alarmRuleId: 'rule-1',
        alarmName: 'Antipanico',
        priority: AlarmPriority.RED,
        activationTime: '2026-03-24T10:00:00.000Z',
        resolutionTime: null,
        position: 'Camera 201',
        userId: 1,
    };

    const alarm2: ActiveAlarm = {
        id: 'active-2',
        alarmRuleId: 'rule-2',
        alarmName: 'Porta aperta',
        priority: AlarmPriority.ORANGE,
        activationTime: '2026-03-24T10:01:00.000Z',
        resolutionTime: null,
        position: 'Corridoio Nord',
        userId: 2,
    };

    const alarmManagementStub = {
        vm$: undefined as unknown,
        initialize: vi.fn(),
        resolveAlarm: vi.fn(),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        vmSubject = new BehaviorSubject<AlarmListVm>({
            alarms: [alarm1, alarm2],
            isResolving: false,
            resolvingId: null,
            resolveError: null,
        });

        alarmManagementStub.vm$ = vmSubject.asObservable();

        await TestBed.configureTestingModule({
            imports: [AlarmPageManagementComponent],
            providers: [{ provide: AlarmManagementService, useValue: alarmManagementStub }],
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

        resolveButtons[0].dispatchEvent(new MouseEvent('click'));
        expect(alarmManagementStub.resolveAlarm).toHaveBeenCalledWith('active-1');
        expect(alarmManagementStub.resolveAlarm).toHaveBeenCalledTimes(1);

        vmSubject.next({
            alarms: [alarm1, alarm2],
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
            alarms: [],
            isResolving: false,
            resolvingId: null,
            resolveError: null,
        });
        fixture.detectChanges();

        nativeElement = fixture.nativeElement as HTMLElement;
        resolveButtons = nativeElement.querySelectorAll('button[aria-label^="Gestisci allarme"]');

        expect(resolveButtons.length).toBe(0);
        expect(nativeElement.querySelector('.alarm-management__empty')?.textContent).toContain(
            'Nessun allarme attivo al momento.'
        );
    });
});
