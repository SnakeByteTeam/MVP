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
    };

    const validFormValue = {
        name: 'Nuova regola',
        plantId: 'plant-1',
        sensorId: 'sensor-1',
        priority: AlarmPriority.GREEN,
        thresholdOperator: ThresholdOperator.GREATER_THAN,
        threshold: 12,
        armingTime: '08:00',
        dearmingTime: '18:00',
        enabled: true,
    };

    beforeEach(async () => {
        vi.clearAllMocks();
        wardApiStub.getAvailablePlants.mockReturnValue(
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
            sensorId: '',
            priority: null,
            thresholdOperator: null,
            threshold: null,
            armingTime: '',
            dearmingTime: '',
            enabled: true,
        });
        expect(component.form.controls.name.disabled).toBe(false);
    });

    it('inizializza in edit mode con prefill da initialRule', () => {
        setInputs('edit', existingRule);

        expect(component.isEditMode()).toBe(true);
        expect(component.form.getRawValue()).toEqual({
            name: 'Porta aperta',
            plantId: '',
            sensorId: 'sensor-9',
            priority: AlarmPriority.ORANGE,
            thresholdOperator: ThresholdOperator.EQUAL_TO,
            threshold: 5,
            armingTime: '07:00',
            dearmingTime: '19:00',
            enabled: true,
        });

        expect(component.form.controls.name.disabled).toBe(true);
        expect(component.form.controls.sensorId.disabled).toBe(true);
    });

    it('buildForm applica i validatori required ai campi richiesti', () => {
        setInputs('create', null);

        component.form.patchValue({
            plantId: '',
            priority: null,
            thresholdOperator: null,
            threshold: null,
        });

        expect(component.form.controls.plantId.invalid).toBe(true);

        component.form.controls.plantId.setValue('plant-1');
        component.form.controls.sensorId.setValue('');

        expect(component.form.controls.sensorId.invalid).toBe(true);
        expect(component.form.controls.priority.invalid).toBe(true);
        expect(component.form.controls.thresholdOperator.invalid).toBe(true);
        expect(component.form.controls.threshold.invalid).toBe(true);
    });

    it('in create mode mantiene il dispositivo bloccato finche non viene selezionato un plant', () => {
        setInputs('create', null);

        expect(component.form.controls.sensorId.disabled).toBe(true);

        component.form.controls.plantId.setValue('plant-1');

        expect(apartmentApiStub.getApartmentByPlantId).toHaveBeenCalledWith('plant-1');
        expect(component.form.controls.sensorId.enabled).toBe(true);
        expect(component.deviceOptions()).toEqual([{ id: 'sensor-1', label: 'Soggiorno - Sensore porta' }]);
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
            sensorId: 'sensor-9',
        });

        component.onSubmit();

        expect(emitSpy).toHaveBeenCalledWith({
            ...validFormValue,
            name: 'Porta aperta',
            plantId: '',
            sensorId: 'sensor-9',
        });
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('onSubmit non invia se il form e invalido', () => {
        setInputs('create', null);
        const emitSpy = vi.spyOn(component.submittedForm, 'emit');
        component.form.patchValue({
            plantId: '',
            sensorId: '',
            priority: null,
            thresholdOperator: null,
            threshold: null,
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

    it('onEnabledToggled aggiorna il controllo enabled', () => {
        setInputs('create', null);

        component.onEnabledToggled(false);

        expect(component.form.controls.enabled.value).toBe(false);
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
            ThresholdOperator.LESS_THAN,
            ThresholdOperator.EQUAL_TO,
        ]);
    });

    it('in edit mode non consente di modificare il dispositivo associato', () => {
        setInputs('edit', existingRule);

        expect(component.form.controls.sensorId.disabled).toBe(true);
        expect(component.deviceOptions()).toEqual([{ id: 'sensor-9', label: 'sensor-9' }]);
    });

    it('imposta errore quando il caricamento dispositivi fallisce', () => {
        apartmentApiStub.getApartmentByPlantId.mockReturnValueOnce(throwError(() => new Error('network')));
        setInputs('create', null);

        component.form.controls.plantId.setValue('plant-1');

        expect(component.devicesLoadError()).toBe('Errore durante il caricamento dei dispositivi.');
        expect(component.form.controls.sensorId.disabled).toBe(true);
    });
});
