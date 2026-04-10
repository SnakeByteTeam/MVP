import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmStateService } from '../../../../core/alarm/services/alarm-state.service';
import { ALARM_LIFECYCLE_UPDATED_EVENT } from '../../../../core/alarm/models/realtime-alarm-event.model';
import type { Apartment } from '../../models/apartment.model';
import { ApartmentApiService } from '../../services/apartment-api.service';
import { ApartmentMonitorComponent } from './apartment-monitor.component';
import { AlarmMapComponent } from '../alarm-map/alarm-map.component';
import { EndpointTableComponent } from '../../../device-interaction/components/endpoint-table/endpoint-table.component';

@Component({
  selector: 'app-alarm-map',
  standalone: true,
  template: '<div class="alarm-map-stub"></div>',
})
class AlarmMapStubWithInputsComponent {
  public readonly rooms = input<unknown[]>([]);
  public readonly activeAlarms = input<unknown[]>([]);
}

@Component({
  selector: 'app-endpoint-table',
  standalone: true,
  template: '<div class="endpoint-table-stub"></div>',
})
class EndpointTableStubComponent {}

describe('ApartmentMonitorComponent', () => {
  let fixture: ComponentFixture<ApartmentMonitorComponent>;
  let component: ApartmentMonitorComponent;

  const apartmentSubject = new BehaviorSubject<Apartment>({
    id: 'ap-1',
    name: 'Appartamento 1',
    isEnabled: true,
    rooms: [],
  });

  const apartmentApiStub = {
    getAvailableApartments: vi.fn().mockReturnValue(of([{ id: 'ap-1', name: 'Appartamento 1' }])),
    getCurrentApartment: vi.fn().mockReturnValue(apartmentSubject.asObservable()),
    setActivePlantId: vi.fn(),
  };

  const alarmStateStub = {
    getActiveAlarms$: vi.fn().mockReturnValue(of([])),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ApartmentMonitorComponent],
      providers: [
        { provide: ApartmentApiService, useValue: apartmentApiStub },
        { provide: AlarmStateService, useValue: alarmStateStub },
      ],
    })
      .overrideComponent(ApartmentMonitorComponent, {
        remove: { imports: [AlarmMapComponent, EndpointTableComponent] },
        add: { imports: [AlarmMapStubWithInputsComponent, EndpointTableStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ApartmentMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('crea il componente e sincronizza activeApartmentId dal feed apartment$', () => {
    expect(component).toBeTruthy();
    expect(component.activeApartmentId).toBe('ap-1');
    expect(apartmentApiStub.getCurrentApartment).toHaveBeenCalled();
  });

  it('onApartmentSelected ignora id vuoto o uguale', () => {
    component.activeApartmentId = 'ap-1';

    component.onApartmentSelected('');
    component.onApartmentSelected('ap-1');

    expect(apartmentApiStub.setActivePlantId).not.toHaveBeenCalled();
  });

  it('onApartmentSelected cambia appartamento, resetta errore e triggera refresh', () => {
    component.error = 'errore precedente';

    component.onApartmentSelected('ap-2');

    expect(apartmentApiStub.setActivePlantId).toHaveBeenCalledWith('ap-2');
    expect(component.error).toBe('');
  });

  it('refresh realtime azzera errore e ricarica apartment$', () => {
    component.error = 'errore';
    const callsBefore = apartmentApiStub.getCurrentApartment.mock.calls.length;

    globalThis.dispatchEvent(new CustomEvent(ALARM_LIFECYCLE_UPDATED_EVENT));

    expect(component.error).toBe('');
    expect(apartmentApiStub.getCurrentApartment.mock.calls.length).toBeGreaterThan(callsBefore);
  });
});
