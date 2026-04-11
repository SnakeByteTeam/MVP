import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmStateService } from 'src/app/core/alarm/services/alarm-state.service';
import { ALARM_LIFECYCLE_UPDATED_EVENT } from 'src/app/core/alarm/models/realtime-alarm-event.model';
import type { Apartment } from 'src/app/features/apartment-monitor/models/apartment.model';
import { ApartmentApiService } from 'src/app/features/apartment-monitor/services/apartment-api.service';
import { ApartmentMonitorComponent } from 'src/app/features/apartment-monitor/components/apartment-monitor/apartment-monitor.component';
import { AlarmMapComponent } from 'src/app/features/apartment-monitor/components/alarm-map/alarm-map.component';
import { EndpointTableComponent } from 'src/app/features/device-interaction/components/endpoint-table/endpoint-table.component';

@Component({
    selector: 'app-alarm-map',
    standalone: true,
    template: '<div class="alarm-map-stub"></div>',
})
class AlarmMapStubComponent {
    public readonly rooms = input<unknown[]>([]);
    public readonly activeAlarms = input<unknown[]>([]);
}

@Component({
    selector: 'app-endpoint-table',
    standalone: true,
    template: '<div class="endpoint-table-stub"></div>',
})
class EndpointTableStubComponent {}

describe('ApartmentMonitor feature integration', () => {
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
                add: { imports: [AlarmMapStubComponent, EndpointTableStubComponent] },
            })
            .compileComponents();

        fixture = TestBed.createComponent(ApartmentMonitorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('TBD-RF inizializza appartamento attivo dal feed e prepara la vista', () => {
        expect(component).toBeTruthy();
        expect(apartmentApiStub.getCurrentApartment).toHaveBeenCalled();
        expect(component.activeApartmentId).toBe('ap-1');
    });

    it('TBD-RF cambio appartamento aggiorna plant attivo e resetta errore', () => {
        component.error = 'errore precedente';

        component.onApartmentSelected('ap-2');

        expect(apartmentApiStub.setActivePlantId).toHaveBeenCalledWith('ap-2');
        expect(component.error).toBe('');
    });

    it('TBD-RF evento realtime forza refresh del caricamento appartamento', () => {
        const beforeCalls = apartmentApiStub.getCurrentApartment.mock.calls.length;

        globalThis.dispatchEvent(new CustomEvent(ALARM_LIFECYCLE_UPDATED_EVENT));

        expect(apartmentApiStub.getCurrentApartment.mock.calls.length).toBeGreaterThan(beforeCalls);
    });
});
