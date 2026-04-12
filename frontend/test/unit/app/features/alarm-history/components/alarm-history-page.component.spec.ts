import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmPriority } from 'src/app/core/alarm/models/alarm-priority.enum';
import type { ActiveAlarm } from 'src/app/core/alarm/models/active-alarm.model';
import type { AlarmListVm } from 'src/app/features/alarm-history/models/alarm-list-vm.model';
import { AlarmHistoryService } from 'src/app/features/alarm-history/services/alarm-history.service';
import { AlarmHistoryPageComponent } from 'src/app/features/alarm-history/components/alarm-history-page.component';

describe('AlarmHistoryPageComponent', () => {
  let fixture: ComponentFixture<AlarmHistoryPageComponent>;
  let component: AlarmHistoryPageComponent;
  let vmSubject: BehaviorSubject<AlarmListVm>;

  const alarmA: ActiveAlarm = {
    id: 'a-1',
    alarmRuleId: 'rule-1',
    alarmName: 'Caduta in bagno',
    priority: AlarmPriority.RED,
    activationTime: '2026-04-09T10:00:00.000Z',
    resolutionTime: '2026-04-09T11:00:00.000Z',
    position: 'Bagno',
    userId: 12,
    userUsername: 'oss_a',
    deviceId: 'device-1',
  };

  const alarmB: ActiveAlarm = {
    id: 'a-2',
    alarmRuleId: 'rule-2',
    alarmName: 'Allarme porta',
    priority: AlarmPriority.ORANGE,
    activationTime: '2026-04-09T12:00:00.000Z',
    resolutionTime: '2026-04-09T12:10:00.000Z',
    position: 'Ingresso',
    userId: null,
    userUsername: null,
  };

  const alarmHistoryServiceStub = {
    vm$: undefined as unknown,
    initialize: vi.fn(),
    nextPage: vi.fn(),
    previousPage: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    vmSubject = new BehaviorSubject<AlarmListVm>({
      alarms: [],
      currentPage: 1,
      pageLimit: 10,
      pageOffset: 0,
      canGoPrevious: false,
      canGoNext: false,
    });
    alarmHistoryServiceStub.vm$ = vmSubject.asObservable();

    await TestBed.configureTestingModule({
      imports: [AlarmHistoryPageComponent],
      providers: [{ provide: AlarmHistoryService, useValue: alarmHistoryServiceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(AlarmHistoryPageComponent);
    component = fixture.componentInstance;
  });

  it('crea il componente e inizializza il service', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(alarmHistoryServiceStub.initialize).toHaveBeenCalledTimes(1);
  });

  it('mappa e ordina le righe per closedAt desc', () => {
    vmSubject.next({
      alarms: [alarmB, alarmA],
      currentPage: 2,
      pageLimit: 10,
      pageOffset: 10,
      canGoPrevious: true,
      canGoNext: false,
    });

    fixture.detectChanges();
    const rows = component.rows();

    expect(rows).toHaveLength(2);
    expect(rows[0].id).toBe('a-2');
    expect(rows[1].id).toBe('a-1');
    expect(rows[0].status).toBe('Gestito');
    expect(rows[0].closedAt).toBe('2026-04-09T12:10:00.000Z');
    expect(rows[0].handlerUsername).toBe('sconosciuto');
    expect(component.currentPage()).toBe(2);
    expect(component.canGoPrevious()).toBe(true);
    expect(component.canGoNext()).toBe(false);
  });

  it('toRow applica fallback e stato per allarme non risolto', () => {
    const unresolvedAlarm: ActiveAlarm = {
      ...alarmA,
      resolutionTime: null,
      userUsername: undefined,
    };

    const row = (component as unknown as { toRow: (alarm: ActiveAlarm) => { status: string; closedAt: string; handlerUsername: string } }).toRow(unresolvedAlarm);

    expect(row.status).toBe('Da gestire');
    expect(row.closedAt).toBe('sconosciuto');
    expect(row.handlerUsername).toBe('sconosciuto');
  });

  it('delega next e previous page al service', () => {
    component.onNextPage();
    component.onPreviousPage();

    expect(alarmHistoryServiceStub.nextPage).toHaveBeenCalledTimes(1);
    expect(alarmHistoryServiceStub.previousPage).toHaveBeenCalledTimes(1);
  });
});
