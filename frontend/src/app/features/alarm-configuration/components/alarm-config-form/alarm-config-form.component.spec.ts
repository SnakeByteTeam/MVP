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
        getAllPlants: vi.fn(),
        getApartmentByPlantId: vi.fn(),
    };

    const existingRule: AlarmRule = {
        id: 'alarm-42',
        name: 'Porta aperta',
        thresholdOperator: '=',
        thresholdValue: 'ON',
        priority: AlarmPriority.ORANGE,
        armingTime: '07:00:00',
        dearmingTime: '19:00:00',
        isArmed: true,
        deviceId: 'sensor-9',
        datapointId: 'dp-readable-1',
        position: 'Appartamento 2 - Ingresso - Sensore porta',
    };

    const validFormValue = {
        name: 'Nuova regola',
        plantId: 'plant-1',
        deviceId: 'sensor-1',
        datapointId: 'dp-readable-2',
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
                                datapoints: [
                                    {
                                        id: 'dp-readable-1',
                                        name: 'SFE_State_OnOff',
                                        readable: true,
                                        writable: false,
                                        valueType: 'string',
                                        enum: ['Off', 'On'],
                                        sfeType: 'SFE_State_OnOff',
                                    },
                                    {
                                        id: 'dp-write-only-1',
                                        name: 'SFE_Cmd_OnOff',
                                        readable: false,
                                        writable: true,
                                        valueType: 'string',
                                        enum: ['Off', 'On'],
                                        sfeType: 'SFE_Cmd_OnOff',
                                    },
                                    {
                                        id: 'dp-readable-2',
                                        name: 'SFE_State_Temperature',
                                        readable: true,
                                        writable: false,
                                        valueType: 'string',
                                        enum: [],
                                        sfeType: 'SFE_State_Temperature',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            })
        );
        apartmentApiStub.getAllPlants.mockReturnValue(
            of([
                {
                    id: 'plant-1',
                    name: 'Appartamento 1',
                    rooms: [
                        {
                            id: 'room-edit',
                            name: 'Ingresso',
                            devices: [
                                {
                                    id: 'sensor-9',
                                    name: 'Sensore porta edit',
                                    type: 'LIGHT',
                                    datapoints: [
                                        {
                                            id: 'dp-readable-1',
                                            name: 'SFE_State_OnOff',
                                            readable: true,
                                            writable: false,
                                            valueType: 'string',
                                            enum: ['Off', 'On'],
                                            sfeType: 'SFE_State_OnOff',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                { id: 'plant-2', name: 'Appartamento 2', rooms: [] },
                { id: 'plant-3', name: 'Appartamento 3', rooms: [] },
            ])
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
            datapointId: '',
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
            datapointId: 'dp-readable-1',
            priority: AlarmPriority.ORANGE,
            thresholdOperator: ThresholdOperator.EQUAL_TO,
            thresholdValue: 'ON',
            armingTime: '07:00',
            dearmingTime: '19:00',
            enabled: true,
        });

        expect(component.form.controls.name.disabled).toBe(true);
        expect(component.form.controls.deviceId.disabled).toBe(true);
        expect(component.form.controls.datapointId.disabled).toBe(true);
        expect(component.form.controls.thresholdOperator.disabled).toBe(true);
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
        component.form.controls.deviceId.setValue('sensor-1');
        component.form.controls.datapointId.setValue('');

        expect(component.form.controls.datapointId.invalid).toBe(true);
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
        expect(component.deviceOptions()[0]?.id).toBe('sensor-1');
        expect(component.deviceOptions()[0]?.label).toBe('Soggiorno - Sensore porta');
    });

    it('mostra solo datapoint leggibili dopo la selezione dispositivo', () => {
        setInputs('create', null);

        component.form.controls.plantId.setValue('plant-1');
        component.form.controls.deviceId.setValue('sensor-1');

        expect(component.datapointOptions().map((datapoint) => datapoint.id)).toEqual([
            'dp-readable-1',
            'dp-readable-2',
        ]);
        expect(component.datapointOptions().every((datapoint) => datapoint.readable)).toBe(true);
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

    it('in edit mode non mostra il campo datapoint nel form', () => {
        setInputs('edit', existingRule);

        const datapointInput = fixture.nativeElement.querySelector('#datapoint') as HTMLInputElement | null;
        expect(datapointInput).toBeNull();
    });

    it('in edit mode mostra thresholdOperator come campo readonly', () => {
        setInputs('edit', existingRule);

        const thresholdOperatorReadonly = fixture.nativeElement.querySelector('#thresholdOperatorReadonly') as HTMLInputElement | null;
        const thresholdOperatorSelect = fixture.nativeElement.querySelector('#thresholdOperator') as HTMLSelectElement | null;

        expect(thresholdOperatorReadonly).not.toBeNull();
        expect(thresholdOperatorReadonly?.value).toBe(ThresholdOperator.EQUAL_TO);
        expect(thresholdOperatorSelect).toBeNull();
    });

    it('in edit mode limita gli operatori al datapoint risolto e resetta operatori non supportati', () => {
        const enumRuleWithUnsupportedOperator: AlarmRule = {
            ...existingRule,
            thresholdOperator: '>',
        };

        setInputs('edit', enumRuleWithUnsupportedOperator);

        expect(component.thresholdOperatorOptions()).toEqual([ThresholdOperator.EQUAL_TO]);
        expect(component.form.controls.thresholdOperator.value).toBeNull();
    });

    it('in edit mode valida thresholdValue in base al datapoint risolto', () => {
        setInputs('edit', existingRule);

        component.form.controls.thresholdValue.enable({ emitEvent: false });
        component.form.controls.thresholdValue.setValue('123');
        component.form.controls.thresholdValue.markAsTouched();
        component.form.controls.thresholdValue.updateValueAndValidity();

        expect(component.form.controls.thresholdValue.errors?.['invalidEnumThreshold']).toBe(true);
    });

    it('in edit mode consente submit anche se i metadati datapoint non sono risolvibili', () => {
        const emitSpy = vi.spyOn(component.submittedForm, 'emit');
        const missingDatapointRule: AlarmRule = {
            ...existingRule,
            datapointId: 'dp-missing',
        };

        setInputs('edit', missingDatapointRule);
        component.onSubmit();

        expect(emitSpy).toHaveBeenCalledWith({
            name: 'Porta aperta',
            plantId: '',
            deviceId: 'sensor-9',
            datapointId: 'dp-missing',
            priority: AlarmPriority.ORANGE,
            thresholdOperator: ThresholdOperator.EQUAL_TO,
            thresholdValue: 'ON',
            armingTime: '07:00',
            dearmingTime: '19:00',
            enabled: true,
        });
        expect(emitSpy).toHaveBeenCalledTimes(1);
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
            datapointId: 'dp-readable-1',
            thresholdOperator: ThresholdOperator.EQUAL_TO,
            thresholdValue: 'ON',
        });

        component.onSubmit();

        expect(emitSpy).toHaveBeenCalledWith({
            ...validFormValue,
            name: 'Porta aperta',
            plantId: '',
            deviceId: 'sensor-9',
            datapointId: 'dp-readable-1',
            thresholdOperator: ThresholdOperator.EQUAL_TO,
            thresholdValue: 'ON',
        });
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('onSubmit non invia se il form e invalido', () => {
        setInputs('create', null);
        const emitSpy = vi.spyOn(component.submittedForm, 'emit');
        component.form.patchValue({
            plantId: '',
            deviceId: '',
            datapointId: '',
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
        expect(component.thresholdOperatorOptions()).toEqual([
            ThresholdOperator.GREATER_THAN,
            ThresholdOperator.GREATER_THAN_OR_EQUAL,
            ThresholdOperator.LESS_THAN,
            ThresholdOperator.LESS_THAN_OR_EQUAL,
            ThresholdOperator.EQUAL_TO,
        ]);
    });

    it('limita operatori e valore soglia quando il datapoint ha enum', () => {
        setInputs('create', null);

        component.form.controls.plantId.setValue('plant-1');
        component.form.controls.deviceId.setValue('sensor-1');
        component.form.controls.datapointId.setValue('dp-readable-1');

        expect(component.thresholdOperatorOptions()).toEqual([ThresholdOperator.EQUAL_TO]);

        component.form.controls.thresholdOperator.setValue(ThresholdOperator.GREATER_THAN);
        component.form.controls.thresholdValue.setValue('Invalid value');
        component.form.controls.thresholdOperator.markAsTouched();
        component.form.controls.thresholdValue.markAsTouched();

        expect(component.form.controls.thresholdOperator.invalid).toBe(true);
        expect(component.form.controls.thresholdValue.invalid).toBe(true);
        expect(component.form.controls.thresholdValue.errors?.['invalidEnumThreshold']).toBe(true);
    });

    it('accetta valore soglia booleano quando operatore e uguale', () => {
        setInputs('create', null);

        component.form.controls.thresholdOperator.setValue(ThresholdOperator.EQUAL_TO);
        component.form.controls.thresholdValue.setValue('ON');

        expect(component.form.controls.thresholdOperator.valid).toBe(true);
        expect(component.form.controls.thresholdValue.valid).toBe(true);
    });

    it('carica impianti da /plant/all deduplicando e ordinando per nome', () => {
        apartmentApiStub.getAllPlants.mockReturnValueOnce(
            of([
                { id: 'plant-3', name: 'Appartamento 3', rooms: [] },
                { id: 'plant-1', name: 'Appartamento 1', rooms: [] },
                { id: 'plant-1', name: 'Appartamento 1', rooms: [] },
                { id: 'plant-2', name: 'Appartamento 2', rooms: [] },
            ])
        );

        setInputs('create', null);

        expect(component.plants().map((plant) => plant.id)).toEqual(['plant-1', 'plant-2', 'plant-3']);
        expect(component.plantsLoadError()).toBeNull();
        expect(apartmentApiStub.getAllPlants).toHaveBeenCalledTimes(1);
    });

    it('se /plant/all fallisce usa fallback available + plants assegnati ai reparti', () => {
        apartmentApiStub.getAllPlants.mockReturnValueOnce(throwError(() => new Error('plant all down')));
        wardApiStub.getAvailablePlants.mockReturnValueOnce(
            of([
                { id: 'plant-7', name: 'Appartamento 7' },
                { id: 'plant-8', name: 'Appartamento 8' },
            ])
        );
        wardApiStub.getWards.mockReturnValueOnce(of([{ id: 90, name: 'Reparto 90' }]));
        wardApiStub.getPlantsByWardId.mockReturnValueOnce(
            of([
                { id: 'plant-9', name: 'Appartamento 9' },
            ])
        );

        setInputs('create', null);

        expect(component.plants().map((plant) => plant.id)).toEqual(['plant-7', 'plant-8', 'plant-9']);
        expect(component.plantsLoadError()).toBeNull();
        expect(wardApiStub.getPlantsByWardId).toHaveBeenCalledTimes(1);
    });

    it('se il plant viene deselezionato resetta opzioni dispositivo e blocca il campo dispositivo', () => {
        setInputs('create', null);

        component.form.controls.plantId.setValue('plant-1');
        expect(component.deviceOptions()[0]?.id).toBe('sensor-1');
        expect(component.form.controls.deviceId.enabled).toBe(true);

        component.form.controls.plantId.setValue('');

        expect(component.deviceOptions()).toEqual([]);
        expect(component.form.controls.deviceId.value).toBe('');
        expect(component.form.controls.deviceId.disabled).toBe(true);
        expect(component.datapointOptions()).toEqual([]);
    });

    it('in edit mode non consente di modificare il dispositivo associato', () => {
        setInputs('edit', existingRule);

        expect(component.form.controls.deviceId.disabled).toBe(true);
        expect(component.deviceOptions()).toEqual([{ id: 'sensor-9', label: 'sensor-9', datapoints: [] }]);
    });

    it('imposta errore quando il caricamento dispositivi fallisce', () => {
        apartmentApiStub.getApartmentByPlantId.mockReturnValueOnce(throwError(() => new Error('network')));
        setInputs('create', null);

        component.form.controls.plantId.setValue('plant-1');

        expect(component.devicesLoadError()).toBe('Errore durante il caricamento dei dispositivi.');
        expect(component.form.controls.deviceId.disabled).toBe(true);
    });
});
