import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmPriority } from 'src/app/core/alarm/models/alarm-priority.enum';
import type { AlarmRule } from 'src/app/core/alarm/models/alarm-rule.model';
import { ThresholdOperator } from 'src/app/core/alarm/models/threshold-operator.enum';
import { AlarmConfigFormComponent } from 'src/app/features/alarm-configuration/components/alarm-config-form/alarm-config-form.component';
import { ApartmentApiService } from 'src/app/features/apartment-monitor/services/apartment-api.service';
import { WardApiService } from 'src/app/features/ward-management/services/ward-api.service';

describe('AlarmConfigForm feature integration', () => {
    let fixture: ComponentFixture<AlarmConfigFormComponent>;
    let component: AlarmConfigFormComponent;

    const wardApiStub = {
        getAvailablePlants: vi.fn(),
        getWards: vi.fn(),
        getPlantsByWardId: vi.fn(),
    };

    const apartmentApiStub = {
        loadApartmentViewForPlantId: vi.fn(),
        getAllPlants: vi.fn(),
    };

    const editRule: AlarmRule = {
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

    beforeEach(async () => {
        vi.clearAllMocks();

        wardApiStub.getAvailablePlants.mockReturnValue(of([{ id: 'plant-1', name: 'Appartamento 1' }]));
        wardApiStub.getWards.mockReturnValue(of([{ id: 10, name: 'Reparto A' }]));
        wardApiStub.getPlantsByWardId.mockReturnValue(of([{ id: 'plant-2', name: 'Appartamento 2' }]));

        apartmentApiStub.loadApartmentViewForPlantId.mockReturnValue(
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
                                type: 'LIGHT',
                                status: 'ONLINE',
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
                                        id: 'dp-readable-2',
                                        name: 'SFE_State_Temperature',
                                        readable: true,
                                        writable: false,
                                        valueType: 'number',
                                        enum: [],
                                        sfeType: 'SFE_State_Temperature',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            }),
        );

        apartmentApiStub.getAllPlants.mockReturnValue(
            of([
                {
                    id: 'plant-1',
                    name: 'Appartamento 1',
                    rooms: [
                        {
                            id: 'room-1',
                            name: 'Soggiorno',
                            devices: [
                                {
                                    id: 'sensor-9',
                                    name: 'Sensore porta edit',
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
            ]),
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

    function setInputs(mode: 'create' | 'edit', initialRule: AlarmRule | null): void {
        fixture.componentRef.setInput('mode', mode);
        fixture.componentRef.setInput('initialRule', initialRule);
        fixture.detectChanges();
    }

    it('RF88-OBL create mode carica impianti e abilita selezione dispositivo', () => {
        setInputs('create', null);

        expect(component.plants().map((plant) => plant.id)).toEqual(['plant-1', 'plant-2']);
        expect(component.form.controls.deviceId.disabled).toBe(true);

        component.form.controls.plantId.setValue('plant-1');

        expect(apartmentApiStub.loadApartmentViewForPlantId).toHaveBeenCalledWith('plant-1');
        expect(component.form.controls.deviceId.enabled).toBe(true);
        expect(component.deviceOptions()[0]?.label).toContain('Soggiorno - Sensore porta');
    });

    it('RF89-OBL selezione datapoint enum limita operatore e valida threshold', () => {
        setInputs('create', null);

        component.form.controls.plantId.setValue('plant-1');
        component.form.controls.deviceId.setValue('sensor-1');
        component.form.controls.datapointId.setValue('dp-readable-1');

        expect(component.thresholdOperatorOptions()).toEqual([ThresholdOperator.EQUAL_TO]);

        component.form.controls.thresholdOperator.setValue(ThresholdOperator.GREATER_THAN);
        component.form.controls.thresholdValue.setValue('invalid');
        component.form.controls.thresholdOperator.markAsTouched();
        component.form.controls.thresholdValue.markAsTouched();
        component.form.controls.thresholdOperator.updateValueAndValidity();
        component.form.controls.thresholdValue.updateValueAndValidity();

        expect(component.form.controls.thresholdOperator.errors?.['unsupportedOperator']).toBe(true);
        expect(component.form.controls.thresholdValue.errors?.['invalidEnumThreshold']).toBe(true);
    });

    it('RF90-OBL submit create mode emette payload valido', () => {
        setInputs('create', null);
        const emitSpy = vi.spyOn(component.submittedForm, 'emit');

        component.form.controls.plantId.setValue('plant-1');
        component.form.setValue({
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
        });

        component.onSubmit();

        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith({
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
        });
    });

    it('RF91-OBL edit mode blocca campi vincolati e mantiene nome originale su submit', () => {
        setInputs('edit', editRule);
        const emitSpy = vi.spyOn(component.submittedForm, 'emit');

        expect(component.form.controls.name.disabled).toBe(true);
        expect(component.form.controls.deviceId.disabled).toBe(true);
        expect(component.form.controls.datapointId.disabled).toBe(true);

        component.form.setValue({
            name: 'Nome modificato manualmente',
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

        component.onSubmit();

        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith({
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
    });

    it('RF92-OBL annulla form emettendo evento cancelled', () => {
        setInputs('create', null);
        const cancelSpy = vi.spyOn(component.cancelled, 'emit');

        component.onCancel();

        expect(cancelSpy).toHaveBeenCalledTimes(1);
    });
});
