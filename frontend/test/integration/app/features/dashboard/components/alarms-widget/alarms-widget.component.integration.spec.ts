import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlarmWidgetComponent } from 'src/app/features/dashboard/components/alarms-widget/alarms-widget.component';
import { AlarmManagementService } from 'src/app/features/alarm-management/services/alarm-management.service';
import { AlarmManagementTablePresenterService } from 'src/app/features/alarm-management/services/alarm-management-table-presenter.service';
import { AlarmManagementRefreshService } from 'src/app/core/alarm/services/alarm-management-refresh.service';
import { Subject } from 'rxjs';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

@Pipe({ name: 'elapsedTime', standalone: true })
class MockElapsedTimePipe implements PipeTransform {
  transform(value: any): string { return '2 min ago'; }
}

describe('AlarmWidgetComponent', () => {
  let component: AlarmWidgetComponent;
  let fixture: ComponentFixture<AlarmWidgetComponent>;
  
  const vmSubject = new Subject<any>();
  const refreshSubject = new Subject<void>();

  const mockAlarmService = {
    initialize: vi.fn(),
    resolveAlarm: vi.fn(),
    vm$: vmSubject.asObservable()
  };

  const mockPresenter = {
    toRows: vi.fn().mockReturnValue([])
  };

  const mockRefreshService = {
    getRefreshRequested$: vi.fn().mockReturnValue(refreshSubject.asObservable())
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [AlarmWidgetComponent, MockElapsedTimePipe],
      providers: [
        { provide: AlarmManagementService, useValue: mockAlarmService },
        { provide: AlarmManagementTablePresenterService, useValue: mockPresenter },
        { provide: AlarmManagementRefreshService, useValue: mockRefreshService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AlarmWidgetComponent);
    component = fixture.componentInstance;
  });

  it('dovrebbe essere creato', () => {
    expect(component).toBeTruthy();
  });

  it('dovrebbe inizializzare il servizio al caricamento (ngOnInit)', () => {
    fixture.detectChanges();
    expect(mockAlarmService.initialize).toHaveBeenCalled();
  });

  it('dovrebbe mostrare lo stato di caricamento se vm è null', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Caricamento allarmi in corso');
  });

  it('dovrebbe mostrare il messaggio "Nessun allarme" se la lista è vuota', () => {
    vmSubject.next({ alarms: [], resolvingId: null, resolveError: null });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nessun allarme attivo al momento');
  });

  it('dovrebbe chiamare resolveAlarm quando onResolve viene invocato', () => {
    const alarmId = '123';
    component.onResolve(alarmId);
    expect(mockAlarmService.resolveAlarm).toHaveBeenCalledWith(alarmId);
  });

  it('dovrebbe ricaricare i dati quando il refresh service emette', () => {
    fixture.detectChanges(); 
    mockAlarmService.initialize.mockClear();
    
    refreshSubject.next(); 
    
    expect(mockAlarmService.initialize).toHaveBeenCalled();
  });

  it('dovrebbe calcolare le righe correttamente tramite il presenter', () => {
    const alarms = [{ id: '1', name: 'Test' }];
    vmSubject.next({ alarms, resolvingId: '1' });
    
    fixture.detectChanges();
    
    expect(mockPresenter.toRows).toHaveBeenCalledWith(alarms, '1');
  });
});