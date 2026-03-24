import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActiveAlarm } from '../../../../core/alarm/models/active-alarm.model';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import type { AlarmListVm } from '../../models/alarm-list-vm.model';
import { AlarmManagementService } from '../../services/alarm-management.service';
import { AlarmItemComponent } from '../alarm-item-component/alarm-item-component';
import { AlarmPageManagementComponent } from './alarm-page-management-component';

@Component({
    selector: 'app-alarm-item-component',
    template: `
    <article class="stub-alarm-item">
      <span class="stub-alarm-id">{{ alarm().id }}</span>
      <button type="button" class="stub-resolve-btn" (click)="emitResolve()">resolve</button>
    </article>
  `,
})
class StubAlarmItemComponent {
    public readonly alarm = input.required<ActiveAlarm>();
    public readonly isResolving = input<boolean>(false);
    public readonly resolve = output<string>();

    public emitResolve(): void {
        this.resolve.emit(this.alarm().id);
    }
}

describe('AlarmManagement feature integration', () => {
    let fixture: ComponentFixture<AlarmPageManagementComponent>;
    let vmSubject: BehaviorSubject<AlarmListVm>;

    const alarm1: ActiveAlarm = {
        id: 'active-1',
        alarmRuleId: 'rule-1',
        alarmName: 'Antipanico',
        priority: AlarmPriority.RED,
        triggeredAt: '2026-03-24T10:00:00.000Z',
    };

    const alarm2: ActiveAlarm = {
        id: 'active-2',
        alarmRuleId: 'rule-2',
        alarmName: 'Porta aperta',
        priority: AlarmPriority.ORANGE,
        triggeredAt: '2026-03-24T10:01:00.000Z',
    };

    const alarmManagementStub = {
        vm$: undefined as unknown,
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
        })
            .overrideComponent(AlarmPageManagementComponent, {
                remove: { imports: [AlarmItemComponent] },
                add: { imports: [StubAlarmItemComponent] },
            })
            .compileComponents();

        fixture = TestBed.createComponent(AlarmPageManagementComponent);
    });

    it('gestisce il flusso completo: render lista, resolve event e aggiornamento vm', () => {
        fixture.detectChanges();

        let nativeElement = fixture.nativeElement as HTMLElement;
        let resolveButtons = nativeElement.querySelectorAll('.stub-resolve-btn');

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

        const childDebugElements = fixture.debugElement.queryAll(By.directive(StubAlarmItemComponent));
        const childA = childDebugElements[0].componentInstance as StubAlarmItemComponent;
        const childB = childDebugElements[1].componentInstance as StubAlarmItemComponent;

        expect(childA.isResolving()).toBe(true);
        expect(childB.isResolving()).toBe(false);
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
        resolveButtons = nativeElement.querySelectorAll('.stub-resolve-btn');

        expect(resolveButtons.length).toBe(0);
        expect(nativeElement.querySelector('.alarm-management__empty')?.textContent).toContain(
            'Nessun allarme attivo al momento.'
        );
    });
});
