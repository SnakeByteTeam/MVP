import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import { ThresholdOperator } from '../../../../core/alarm/models/threshold-operator.enum';
import type { AlarmRule } from '../../../../core/alarm/models/alarm-rule.model';
import { AlarmConfigFormComponent } from './alarm-config-form.component';

describe('AlarmConfigFormComponent', () => {
    let component: AlarmConfigFormComponent;
    let fixture: ComponentFixture<AlarmConfigFormComponent>;

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
        armingTime: '08:00',
        dearmingTime: '18:00',
        enabled: true,
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        await TestBed.configureTestingModule({
            imports: [AlarmConfigFormComponent],
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
            sensorId: '',
            priority: null,
            thresholdOperator: null,
            threshold: null,
            armingTime: '',
            dearmingTime: '',
            enabled: true,
        });
    });

    it('inizializza in edit mode con prefill da initialRule', () => {
        setInputs('edit', existingRule);

        expect(component.isEditMode()).toBe(true);
        expect(component.form.getRawValue()).toEqual({
            name: 'Porta aperta',
            sensorId: 'sensor-9',
            priority: AlarmPriority.ORANGE,
            thresholdOperator: ThresholdOperator.EQUAL_TO,
            threshold: 5,
            armingTime: '07:00',
            dearmingTime: '19:00',
            enabled: true,
        });
    });

    it('buildForm applica i validatori required ai campi richiesti', () => {
        setInputs('create', null);

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

    it('onSubmit emette submittedForm in create mode con form valido', () => {
        setInputs('create', null);
        const emitSpy = vi.spyOn(component.submittedForm, 'emit');
        component.form.setValue(validFormValue);

        component.onSubmit();

        expect(emitSpy).toHaveBeenCalledWith(validFormValue);
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('onSubmit in edit mode emette submittedForm con form valido', () => {
        setInputs('edit', existingRule);
        const emitSpy = vi.spyOn(component.submittedForm, 'emit');
        component.form.setValue(validFormValue);

        component.onSubmit();

        expect(emitSpy).toHaveBeenCalledWith(validFormValue);
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('onSubmit non invia se il form e invalido', () => {
        setInputs('create', null);
        const emitSpy = vi.spyOn(component.submittedForm, 'emit');
        component.form.patchValue({
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
});
