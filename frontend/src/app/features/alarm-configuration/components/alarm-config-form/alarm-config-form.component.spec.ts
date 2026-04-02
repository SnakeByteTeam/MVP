import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EMPTY, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import { ThresholdOperator } from '../../../../core/alarm/models/threshold-operator.enum';
import type { AlarmRule } from '../../../../core/alarm/models/alarm-rule.model';
import { AlarmConfigStateService } from '../../services/alarm-config-state.service';
import { AlarmConfigFormComponent } from './alarm-config-form.component';

describe('AlarmConfigFormComponent', () => {
    let component: AlarmConfigFormComponent;
    let fixture: ComponentFixture<AlarmConfigFormComponent>;

    const routeStub = {
        snapshot: {
            paramMap: convertToParamMap({}),
        },
    };

    const routerStub = {
        navigate: vi.fn().mockResolvedValue(true),
    };

    const stateServiceStub = {
        getAlarmRuleById: vi.fn(),
        createAlarmRule: vi.fn(() => of({} as AlarmRule)),
        updateAlarmRule: vi.fn(() => of({} as AlarmRule)),
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
        sensorId: 'sensor-1',
        priority: AlarmPriority.GREEN,
        thresholdOperator: ThresholdOperator.GREATER_THAN,
        threshold: 12,
        activationTime: '08:00',
        deactivationTime: '18:00',
        enabled: true,
    };

    beforeEach(async () => {
        vi.clearAllMocks();
        routeStub.snapshot.paramMap = convertToParamMap({});
        stateServiceStub.getAlarmRuleById.mockReturnValue(of(existingRule));

        await TestBed.configureTestingModule({
            imports: [AlarmConfigFormComponent],
            providers: [
                { provide: AlarmConfigStateService, useValue: stateServiceStub },
                { provide: Router, useValue: routerStub },
                { provide: ActivatedRoute, useValue: routeStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AlarmConfigFormComponent);
        component = fixture.componentInstance;
    });

    it('crea il componente', () => {
        fixture.detectChanges();

        expect(component).toBeTruthy();
    });

    it('inizializza in create mode se id non e presente', () => {
        routeStub.snapshot.paramMap = convertToParamMap({});

        fixture.detectChanges();

        expect(component.isEditMode).toBe(false);
        expect(stateServiceStub.getAlarmRuleById).not.toHaveBeenCalled();
    });

    it('inizializza in edit mode se id e presente e precompila il form', () => {
        routeStub.snapshot.paramMap = convertToParamMap({ id: 'alarm-42' });

        fixture.detectChanges();

        expect(component.isEditMode).toBe(true);
        expect(stateServiceStub.getAlarmRuleById).toHaveBeenCalledWith('alarm-42');
        expect(component.form.getRawValue()).toEqual({
            name: 'Porta aperta',
            sensorId: 'sensor-9',
            priority: AlarmPriority.ORANGE,
            thresholdOperator: ThresholdOperator.EQUAL_TO,
            threshold: 5,
            activationTime: '07:00',
            deactivationTime: '19:00',
            enabled: true,
        });
    });

    it('in edit mode naviga indietro se il caricamento regola fallisce', () => {
        routeStub.snapshot.paramMap = convertToParamMap({ id: 'alarm-42' });
        stateServiceStub.getAlarmRuleById.mockReturnValue(throwError(() => new Error('boom')));

        fixture.detectChanges();

        expect(routerStub.navigate).toHaveBeenCalledWith(['../'], { relativeTo: routeStub });
    });

    it('in edit mode naviga indietro se getAlarmRuleById completa senza emissioni', () => {
        routeStub.snapshot.paramMap = convertToParamMap({ id: 'alarm-42' });
        stateServiceStub.getAlarmRuleById.mockReturnValue(EMPTY);

        fixture.detectChanges();

        expect(routerStub.navigate).toHaveBeenCalledWith(['../'], { relativeTo: routeStub });
    });

    it('buildForm applica i validatori required ai campi richiesti', () => {
        fixture.detectChanges();

        component.form.patchValue({
            sensorId: '',
            priority: null,
            thresholdOperator: null,
            threshold: null,
        });

        expect(component.form.controls.sensorId.invalid).toBe(true);
        expect(component.form.controls.priority.invalid).toBe(true);
        expect(component.form.controls.thresholdOperator.invalid).toBe(true);
        expect(component.form.controls.threshold.invalid).toBe(true);
    });

    it('onSubmit in create mode invoca createAlarmRule e naviga alla lista', () => {
        fixture.detectChanges();
        component.form.setValue(validFormValue);

        component.onSubmit();

        expect(stateServiceStub.createAlarmRule).toHaveBeenCalledWith(validFormValue);
        expect(routerStub.navigate).toHaveBeenCalledWith(['../'], { relativeTo: routeStub });
    });

    it('onSubmit in create mode non naviga se createAlarmRule non emette (errore gestito)', () => {
        stateServiceStub.createAlarmRule.mockReturnValueOnce(EMPTY);
        fixture.detectChanges();
        component.form.setValue(validFormValue);

        component.onSubmit();

        expect(stateServiceStub.createAlarmRule).toHaveBeenCalledWith(validFormValue);
        expect(routerStub.navigate).not.toHaveBeenCalled();
    });

    it('onSubmit in edit mode invoca updateAlarmRule con id route e naviga alla lista', () => {
        routeStub.snapshot.paramMap = convertToParamMap({ id: 'alarm-42' });
        fixture.detectChanges();
        component.form.setValue(validFormValue);

        component.onSubmit();

        expect(stateServiceStub.updateAlarmRule).toHaveBeenCalledWith('alarm-42', validFormValue);
        expect(routerStub.navigate).toHaveBeenCalledWith(['../'], { relativeTo: routeStub });
    });

    it('onSubmit in edit mode non naviga se updateAlarmRule non emette (errore gestito)', () => {
        routeStub.snapshot.paramMap = convertToParamMap({ id: 'alarm-42' });
        stateServiceStub.updateAlarmRule.mockReturnValueOnce(EMPTY);
        fixture.detectChanges();
        component.form.setValue(validFormValue);

        component.onSubmit();

        expect(stateServiceStub.updateAlarmRule).toHaveBeenCalledWith('alarm-42', validFormValue);
        expect(routerStub.navigate).not.toHaveBeenCalled();
    });

    it('onSubmit non invia se il form e invalido', () => {
        fixture.detectChanges();
        component.form.patchValue({
            sensorId: '',
            priority: null,
            thresholdOperator: null,
            threshold: null,
        });

        component.onSubmit();

        expect(stateServiceStub.createAlarmRule).not.toHaveBeenCalled();
        expect(stateServiceStub.updateAlarmRule).not.toHaveBeenCalled();
    });

    it('onSubmit in edit mode senza id non invia update', () => {
        routeStub.snapshot.paramMap = convertToParamMap({});
        fixture.detectChanges();
        component.isEditMode = true;
        component.form.setValue(validFormValue);

        component.onSubmit();

        expect(stateServiceStub.updateAlarmRule).not.toHaveBeenCalled();
    });

    it('onCancel naviga verso ../', () => {
        fixture.detectChanges();

        component.onCancel();

        expect(routerStub.navigate).toHaveBeenCalledWith(['../'], { relativeTo: routeStub });
    });

    it('espone opzioni enum per priorita e operatore', () => {
        fixture.detectChanges();

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
});
