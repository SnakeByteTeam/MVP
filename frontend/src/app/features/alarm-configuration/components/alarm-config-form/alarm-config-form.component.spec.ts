import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import { ThresholdOperator } from '../../../../core/alarm/models/threshold-operator.enum';
import { ApartmentApiService } from '../../../apartment-monitor/services/apartment-api.service';
import { WardApiService } from '../../../ward-management/services/ward-api.service';
import type { AlarmRule } from '../../../../core/alarm/models/alarm-rule.model';
import { AlarmConfigFormComponent } from './alarm-config-form.component';

describe('AlarmConfigFormComponent', () => {
    let component: AlarmConfigFormComponent;
    let fixture: ComponentFixture<AlarmConfigFormComponent>;

    const wardApiStub = {
        getAvailablePlants: vi.fn(),
        getWards: vi.fn(),
        getPlantsByWardId: vi.fn(),
    };

    const apartmentApiStub = {
        getApartmentByPlantId: vi.fn(),
    };

    const existingRule: AlarmRule = {
        id: 'alarm-42',
        name: 'Porta aperta',
        thresholdOperator: '=',
        thresholdValue: '5',
        priority: AlarmPriority.ORANGE,
        armingTime: '07:00:00',
        dearmingTime: '19:00:00',
        isArmed: true,
        deviceId: 'sensor-9',
        position: 'Appartamento 2 - Ingresso - Sensore porta',
    };

    const validFormValue = {
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

    beforeEach(async () => {
        vi.clearAllMocks();
        wardApiStub.getAvailablePlants.mockReturnValue(
            of([
                { id: 'plant-1', name: 'Appartamento 1' },
                { id: 'plant-3', name: 'Appartamento 3' },
            ])
        );
        wardApiStub.getWards.mockReturnValue(
            of([{ id: 10, name: 'Reparto A' }])
        );
        wardApiStub.getPlantsByWardId.mockReturnValue(
            of([
                { id: 'plant-1', name: 'Appartamento 1' },
                { id: 'plant-2', name: 'Appartamento 2' },
            ])
        );
        apartmentApiStub.getApartmentByPlantId.mockReturnValue(
            of({
                id: 'plant-1',
                name: 'Appartamento 1',
                isEnabled: true,
                rooms: [
                    {
                        id: 'room-1',
                        name: 'Soggiorno',
                        hasActiveAlarm: false,
                        devices: [
                            {
                                id: 'sensor-1',
                                name: 'Sensore porta',
                                status: 'ONLINE',
                                type: 'LIGHT',
                                actions: [],
                            },
                        ],
                    },
                ],
            })
        );

        await TestBed.configureTestingModule({
            imports: [AlarmConfigFormComponent],
            providers: [
                { provide: WardApiService, useValue: wardApiStub },
                { provide: ApartmentApiService, useValue: apartmentApiStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AlarmConfigFormComponent);
        component = fixture.componentInstance;
    });

    const setInputs = (mode: 'create' | 'edit', initialRule: AlarmRule | null): void => {
        fixture.componentRef.setInput('mode', mode);
        fixture.componentRef.setInput('initialRule', initialRule);
        fixture.detectChanges();
    };

    it('crea il componente', () => {
        setInputs('create', null);

        expect(component).toBeTruthy();
    });

    it('inizializza in create mode con form vuoto', () => {
        setInputs('create', null);

        expect(component.isEditMode()).toBe(false);
        expect(component.form.getRawValue()).toEqual({
            name: '',
            plantId: '',
            deviceId: '',
            priority: null,
            thresholdOperator: null,
            thresholdValue: '',
            armingTime: '',
            dearmingTime: '',
            enabled: true,
        });
        expect(component.form.controls.name.disabled).toBe(false);
        expect(component.plants().map((plant) => plant.id)).toEqual(['plant-1', 'plant-2', 'plant-3']);
    });

    it('inizializza in edit mode con prefill da initialRule', () => {
        setInputs('edit', existingRule);

        expect(component.isEditMode()).toBe(true);
        expect(component.form.getRawValue()).toEqual({
            name: 'Porta aperta',
            plantId: '',
            deviceId: 'sensor-9',
            priority: AlarmPriority.ORANGE,
            thresholdOperator: ThresholdOperator.EQUAL_TO,
            thresholdValue: '5',
            armingTime: '07:00',
            dearmingTime: '19:00',
            enabled: true,
        });

        expect(component.form.controls.name.disabled).toBe(true);
        expect(component.form.controls.deviceId.disabled).toBe(true);
    });

    it('buildForm applica i validatori required ai campi richiesti', () => {
        setInputs('create', null);

        component.form.patchValue({
            plantId: '',
            priority: null,
            thresholdOperator: null,
            thresholdValue: '',
        });

        expect(component.form.controls.plantId.invalid).toBe(true);

        component.form.controls.plantId.setValue('plant-1');
        component.form.controls.deviceId.setValue('');

        expect(component.form.controls.deviceId.invalid).toBe(true);
        expect(component.form.controls.priority.invalid).toBe(true);
        expect(component.form.controls.thresholdOperator.invalid).toBe(true);
        expect(component.form.controls.thresholdValue.invalid).toBe(true);
    });

    it('in create mode mantiene il dispositivo bloccato finche non viene selezionato un plant', () => {
        setInputs('create', null);

        expect(component.form.controls.deviceId.disabled).toBe(true);

        component.form.controls.plantId.setValue('plant-1');

        expect(apartmentApiStub.getApartmentByPlantId).toHaveBeenCalledWith('plant-1');
        expect(component.form.controls.deviceId.enabled).toBe(true);
        expect(component.deviceOptions()).toEqual([{ id: 'sensor-1', label: 'Soggiorno - Sensore porta' }]);
    });

    it('in create mode non mostra il campo posizione read-only', () => {
        setInputs('create', null);

        const positionInput = fixture.nativeElement.querySelector('#position');
        expect(positionInput).toBeNull();
    });

    it('in edit mode mostra il campo posizione read-only valorizzato', () => {
        setInputs('edit', existingRule);

        const positionInput = fixture.nativeElement.querySelector('#position') as HTMLInputElement | null;
        expect(positionInput).not.toBeNull();
        expect(positionInput?.value).toBe('Appartamento 2 - Ingresso - Sensore porta');
    });

    it('onSubmit emette submittedForm in create mode con form valido', () => {
        setInputs('create', null);
        const emitSpy = vi.spyOn(component.submittedForm, 'emit');

        component.form.controls.plantId.setValue('plant-1');
        component.form.setValue(validFormValue);

        component.onSubmit();

        expect(emitSpy).toHaveBeenCalledWith(validFormValue);
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('onSubmit in edit mode emette submittedForm con form valido', () => {
        setInputs('edit', existingRule);
        const emitSpy = vi.spyOn(component.submittedForm, 'emit');
        component.form.setValue({
            ...validFormValue,
            name: 'Nome modificato manualmente',
            plantId: '',
            deviceId: 'sensor-9',
        });

        component.onSubmit();

        expect(emitSpy).toHaveBeenCalledWith({
            ...validFormValue,
            name: 'Porta aperta',
            plantId: '',
            deviceId: 'sensor-9',
        });
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('onSubmit non invia se il form e invalido', () => {
        setInputs('create', null);
        const emitSpy = vi.spyOn(component.submittedForm, 'emit');
        component.form.patchValue({
            plantId: '',
            deviceId: '',
            priority: null,
            thresholdOperator: null,
            thresholdValue: '',
        });

        component.onSubmit();

        expect(emitSpy).not.toHaveBeenCalled();
    });

    it('onCancel emette evento cancelled', () => {
        setInputs('create', null);
        const emitSpy = vi.spyOn(component.cancelled, 'emit');

        component.onCancel();

        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('espone opzioni enum per priorita e operatore', () => {
        setInputs('create', null);

        expect(component.priorityOptions).toEqual([
            AlarmPriority.WHITE,
            AlarmPriority.GREEN,
            AlarmPriority.ORANGE,
            AlarmPriority.RED,
        ]);
        expect(component.thresholdOperatorOptions).toEqual([
            ThresholdOperator.GREATER_THAN,
            ThresholdOperator.GREATER_THAN_OR_EQUAL,
            ThresholdOperator.LESS_THAN,
            ThresholdOperator.LESS_THAN_OR_EQUAL,
            ThresholdOperator.EQUAL_TO,
        ]);
    });

    it('accetta valore soglia booleano quando operatore e uguale', () => {
        setInputs('create', null);

        component.form.controls.thresholdOperator.setValue(ThresholdOperator.EQUAL_TO);
        component.form.controls.thresholdValue.setValue('ON');

        expect(component.form.controls.thresholdOperator.valid).toBe(true);
        expect(component.form.controls.thresholdValue.valid).toBe(true);
    });

    it('carica impianti da piu reparti deduplicando per id', () => {
        wardApiStub.getAvailablePlants.mockReturnValueOnce(
            of([{ id: 'plant-1', name: 'Appartamento 1' }])
        );
        wardApiStub.getWards.mockReturnValueOnce(
            of([
                { id: 10, name: 'Reparto A' },
                { id: 20, name: 'Reparto B' },
            ])
        );
        wardApiStub.getPlantsByWardId.mockImplementation((wardId: number) => {
            if (wardId === 10) {
                return of([
                    { id: 'plant-2', name: 'Appartamento 2' },
                    { id: 'plant-3', name: 'Appartamento 3' },
                ]);
            }

            return of([
                { id: 'plant-3', name: 'Appartamento 3' },
                { id: 'plant-4', name: 'Appartamento 4' },
            ]);
        });

        setInputs('create', null);

        expect(wardApiStub.getPlantsByWardId).toHaveBeenCalledTimes(2);
        expect(component.plants().map((plant) => plant.id)).toEqual(['plant-1', 'plant-2', 'plant-3', 'plant-4']);
        expect(component.plantsLoadError()).toBeNull();
    });

    it('se il recupero reparti fallisce usa solo gli impianti disponibili', () => {
        wardApiStub.getAvailablePlants.mockReturnValueOnce(
            of([
                { id: 'plant-7', name: 'Appartamento 7' },
                { id: 'plant-8', name: 'Appartamento 8' },
            ])
        );
        wardApiStub.getWards.mockReturnValueOnce(throwError(() => new Error('wards down')));

        setInputs('create', null);

        expect(component.plants().map((plant) => plant.id)).toEqual(['plant-7', 'plant-8']);
        expect(component.plantsLoadError()).toBeNull();
        expect(wardApiStub.getPlantsByWardId).not.toHaveBeenCalled();
    });

    it('se il plant viene deselezionato resetta opzioni dispositivo e blocca il campo dispositivo', () => {
        setInputs('create', null);

        component.form.controls.plantId.setValue('plant-1');
        expect(component.deviceOptions()).toEqual([{ id: 'sensor-1', label: 'Soggiorno - Sensore porta' }]);
        expect(component.form.controls.deviceId.enabled).toBe(true);

        component.form.controls.plantId.setValue('');

        expect(component.deviceOptions()).toEqual([]);
        expect(component.form.controls.deviceId.value).toBe('');
        expect(component.form.controls.deviceId.disabled).toBe(true);
    });

    it('in edit mode non consente di modificare il dispositivo associato', () => {
        setInputs('edit', existingRule);

        expect(component.form.controls.deviceId.disabled).toBe(true);
        expect(component.deviceOptions()).toEqual([{ id: 'sensor-9', label: 'sensor-9' }]);
    });

    it('imposta errore quando il caricamento dispositivi fallisce', () => {
        apartmentApiStub.getApartmentByPlantId.mockReturnValueOnce(throwError(() => new Error('network')));
        setInputs('create', null);

        component.form.controls.plantId.setValue('plant-1');

        expect(component.devicesLoadError()).toBe('Errore durante il caricamento dei dispositivi.');
        expect(component.form.controls.deviceId.disabled).toBe(true);
    });
});
