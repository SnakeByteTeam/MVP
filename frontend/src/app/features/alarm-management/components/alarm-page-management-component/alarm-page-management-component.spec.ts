import { Component, output, input } from '@angular/core';
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
  template: '<button type="button" class="stub-resolve" (click)="emitResolve()">resolve</button>',
})
class MockAlarmItemComponent {
  public readonly alarm = input.required<ActiveAlarm>();
  public readonly isResolving = input<boolean>(false);
  public readonly resolve = output<string>();

  public emitResolve(): void {
    this.resolve.emit(this.alarm().id);
  }
}

describe('AlarmPageManagementComponent', () => {
  let component: AlarmPageManagementComponent;
  let fixture: ComponentFixture<AlarmPageManagementComponent>;
  let vmSubject: BehaviorSubject<AlarmListVm>;

  const alarm1: ActiveAlarm = {
    id: 'active-1',
    alarmRuleId: 'rule-1',
    alarmName: 'Antipanico',
    priority: AlarmPriority.RED,
    triggeredAt: '2026-03-24T10:00:00.000Z',
    resolvedAt: null,
    user_id: null,
  };

  const alarm2: ActiveAlarm = {
    id: 'active-2',
    alarmRuleId: 'rule-2',
    alarmName: 'Porta aperta',
    priority: AlarmPriority.ORANGE,
    triggeredAt: '2026-03-24T10:01:00.000Z',
    resolvedAt: null,
    user_id: null,
  };

  const alarmManagementStub = {
    vm$: undefined as unknown,
    initialize: vi.fn(),
    resolveAlarm: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    vmSubject = new BehaviorSubject<AlarmListVm>({
      alarms: [],
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
        add: { imports: [MockAlarmItemComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AlarmPageManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('ngOnInit assegna vm$ dalla facade', () => {
    expect(component.vm$).toBeUndefined();

    component.ngOnInit();

    expect(alarmManagementStub.initialize).toHaveBeenCalledTimes(1);
    expect(component.vm$).toBe(alarmManagementStub.vm$);
  });

  it('onResolve delega a facade.resolveAlarm', () => {
    component.onResolve('active-2');

    expect(alarmManagementStub.resolveAlarm).toHaveBeenCalledWith('active-2');
    expect(alarmManagementStub.resolveAlarm).toHaveBeenCalledTimes(1);
  });

  it('renderizza stato lista vuota quando non ci sono allarmi', () => {
    vmSubject.next({
      alarms: [],
      isResolving: false,
      resolvingId: null,
      resolveError: null,
    });

    fixture.detectChanges();
    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelector('.alarm-management__empty')?.textContent).toContain(
      'Nessun allarme attivo al momento.'
    );
    expect(nativeElement.querySelectorAll('app-alarm-item-component').length).toBe(0);
  });

  it('renderizza errore e stato resolving quando presenti nel vm', () => {
    vmSubject.next({
      alarms: [alarm1],
      isResolving: true,
      resolvingId: alarm1.id,
      resolveError: 'Errore durante la risoluzione',
    });

    fixture.detectChanges();
    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelector('.alarm-management__error')?.textContent).toContain(
      'Errore durante la risoluzione'
    );
    expect(nativeElement.querySelector('.alarm-management__status')?.textContent).toContain(
      'Risoluzione allarme in corso...'
    );
  });

  it('renderizza un child per ogni allarme e passa correttamente isResolving per-item', () => {
    vmSubject.next({
      alarms: [alarm1, alarm2],
      isResolving: true,
      resolvingId: alarm2.id,
      resolveError: null,
    });

    fixture.detectChanges();

    const childDebugElements = fixture.debugElement.queryAll(By.directive(MockAlarmItemComponent));
    expect(childDebugElements.length).toBe(2);

    const firstChild = childDebugElements[0].componentInstance as MockAlarmItemComponent;
    const secondChild = childDebugElements[1].componentInstance as MockAlarmItemComponent;

    expect(firstChild.alarm().id).toBe('active-1');
    expect(firstChild.isResolving()).toBe(false);
    expect(secondChild.alarm().id).toBe('active-2');
    expect(secondChild.isResolving()).toBe(true);
  });

  it('propaga evento resolve dal child verso facade.resolveAlarm', () => {
    vmSubject.next({
      alarms: [alarm1],
      isResolving: false,
      resolvingId: null,
      resolveError: null,
    });

    fixture.detectChanges();
    const childDebugElement = fixture.debugElement.query(By.directive(MockAlarmItemComponent));
    const childComponent = childDebugElement.componentInstance as MockAlarmItemComponent;

    childComponent.emitResolve();

    expect(alarmManagementStub.resolveAlarm).toHaveBeenCalledWith('active-1');
    expect(alarmManagementStub.resolveAlarm).toHaveBeenCalledTimes(1);
  });
});
