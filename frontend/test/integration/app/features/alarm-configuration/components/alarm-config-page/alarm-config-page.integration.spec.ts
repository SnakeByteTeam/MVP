import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, EMPTY, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmPriority } from 'src/app/core/alarm/models/alarm-priority.enum';
import type { AlarmRule } from 'src/app/core/alarm/models/alarm-rule.model';
import { ThresholdOperator } from 'src/app/core/alarm/models/threshold-operator.enum';
import { ApartmentApiService } from 'src/app/features/apartment-monitor/services/apartment-api.service';
import { AlarmConfigPageComponent } from 'src/app/features/alarm-configuration/components/alarm-config-page/alarm-config-page.component';
import { AlarmConfigStateService } from 'src/app/features/alarm-configuration/services/alarm-config-state.service';
import { WardApiService } from 'src/app/features/ward-management/services/ward-api.service';

describe('AlarmConfiguration feature integration', () => {
    let fixture: ComponentFixture<AlarmConfigPageComponent>;
    let component: AlarmConfigPageComponent;
    let alarmsSubject: BehaviorSubject<AlarmRule[]>;

    const alarmRule: AlarmRule = {
        id: 'alarm-1',
        name: 'Temperatura alta',
        thresholdOperator: '>',
        thresholdValue: '30',
        priority: AlarmPriority.RED,
        armingTime: '08:00:00',
        dearmingTime: '20:00:00',
        isArmed: true,
        deviceId: 'dev-1',
        position: 'Appartamento 1 - Soggiorno - Sensore porta',
    };

    const formValue = {
        name: 'Nuova regola',
        plantId: 'plant-1',
        deviceId: 'sensor-1',
        priority: AlarmPriority.GREEN,
        thresholdOperator: ThresholdOperator.GREATER_THAN,
        thresholdValue: '12',
        armingTime: '08:00',
        dearmingTime: '18:00',
        enabled: true,
    };

    const wardApiStub = {
        getAvailablePlants: vi.fn(() => of([])),
        getWards: vi.fn(() => of([])),
        getPlantsByWardId: vi.fn(() => of([])),
    };

    const apartmentApiStub = {
        loadApartmentViewForPlantId: vi.fn(() => of({ id: 'plant-1', name: 'Plant', isEnabled: true, rooms: [] })),
    };

    let stateServiceStub: {
        alarms$: ReturnType<BehaviorSubject<AlarmRule[]>['asObservable']>;
        error$: ReturnType<BehaviorSubject<string | null>['asObservable']>;
        loadAlarmRules: ReturnType<typeof vi.fn>;
        createAlarmRule: ReturnType<typeof vi.fn>;
        updateAlarmRule: ReturnType<typeof vi.fn>;
        toggleEnabled: ReturnType<typeof vi.fn>;
        deleteAlarmRule: ReturnType<typeof vi.fn>;
    };

    beforeEach(async () => {
        vi.clearAllMocks();
        alarmsSubject = new BehaviorSubject<AlarmRule[]>([]);

        stateServiceStub = {
            alarms$: alarmsSubject.asObservable(),
            error$: new BehaviorSubject<string | null>(null).asObservable(),
            loadAlarmRules: vi.fn(),
            createAlarmRule: vi.fn(() => of({} as AlarmRule)),
            updateAlarmRule: vi.fn(() => of({} as AlarmRule)),
            toggleEnabled: vi.fn(() => of({} as AlarmRule)),
            deleteAlarmRule: vi.fn(() => of(void 0)),
        };

        await TestBed.configureTestingModule({
            imports: [AlarmConfigPageComponent],
            providers: [
                { provide: AlarmConfigStateService, useValue: stateServiceStub },
                { provide: WardApiService, useValue: wardApiStub },
                { provide: ApartmentApiService, useValue: apartmentApiStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AlarmConfigPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('TBD-RF inizializza pagina e carica regole allarme', () => {
        expect(component).toBeTruthy();
        expect(stateServiceStub.loadAlarmRules).toHaveBeenCalledTimes(1);
    });

    it('TBD-RF create mode invia form al servizio e chiude modale', () => {
        component.onCreateNew();
        component.onFormSubmitted(formValue);

        expect(stateServiceStub.createAlarmRule).toHaveBeenCalledWith(formValue);
        expect(component.isModalOpen()).toBe(false);
    });

    it('TBD-RF edit mode mantiene modale aperta se update non emette esito', () => {
        alarmsSubject.next([alarmRule]);
        fixture.detectChanges();
        component.onEdit('alarm-1');
        stateServiceStub.updateAlarmRule.mockReturnValueOnce(EMPTY);

        component.onFormSubmitted(formValue);

        expect(component.isModalOpen()).toBe(true);
        expect(component.editingRule()?.id).toBe('alarm-1');
    });
});
