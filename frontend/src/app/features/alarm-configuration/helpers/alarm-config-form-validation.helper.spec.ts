import { FormControl } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThresholdOperator } from '../../../core/alarm/models/threshold-operator.enum';
import { Datapoint } from '../../apartment-monitor/models/datapoint.model';
import { AlarmConfigFormValidationHelper } from './alarm-config-form-validation.helper';

describe('AlarmConfigFormValidationHelper', () => {
    let helper: AlarmConfigFormValidationHelper;

    const enumDatapoint: Datapoint = {
        id: 'dp-enum',
        name: 'SFE_State_OnOff',
        readable: true,
        writable: false,
        valueType: 'string',
        enum: ['Off', 'On'],
        sfeType: 'SFE_State_OnOff',
    };

    const numericDatapoint: Datapoint = {
        id: 'dp-numeric',
        name: 'SFE_State_Value',
        readable: true,
        writable: false,
        valueType: 'string',
        enum: [],
        sfeType: 'SFE_State_Value',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [AlarmConfigFormValidationHelper] });
        helper = TestBed.inject(AlarmConfigFormValidationHelper);
    });

    it('in create mode con enum forza operatore uguale e valida threshold su enum', () => {
        const operatorControl = new FormControl<ThresholdOperator | null>(ThresholdOperator.GREATER_THAN);
        const valueControl = new FormControl('INVALID');

        helper.applyThresholdConstraints({
            mode: 'create',
            datapoint: enumDatapoint,
            thresholdOperatorControl: operatorControl,
            thresholdValueControl: valueControl,
        });

        expect(operatorControl.value).toBeNull();
        expect(valueControl.errors?.['invalidEnumThreshold']).toBe(true);
    });

    it('in create mode con datapoint numerico applica validazione numerica', () => {
        const operatorControl = new FormControl<ThresholdOperator | null>(ThresholdOperator.GREATER_THAN);
        const valueControl = new FormControl('abc');

        helper.applyThresholdConstraints({
            mode: 'create',
            datapoint: numericDatapoint,
            thresholdOperatorControl: operatorControl,
            thresholdValueControl: valueControl,
        });

        expect(operatorControl.value).toBe(ThresholdOperator.GREATER_THAN);
        expect(valueControl.errors?.['pattern']).toBeTruthy();
    });

    it('in edit mode con datapoint enum applica lo stesso vincolo operatore della create', () => {
        const operatorControl = new FormControl<ThresholdOperator | null>(ThresholdOperator.LESS_THAN);
        const valueControl = new FormControl('abc');

        helper.applyThresholdConstraints({
            mode: 'edit',
            datapoint: enumDatapoint,
            thresholdOperatorControl: operatorControl,
            thresholdValueControl: valueControl,
        });

        expect(operatorControl.value).toBeNull();
        expect(valueControl.errors?.['invalidEnumThreshold']).toBe(true);
    });

    it('in edit mode con datapoint numerico applica validazione numerica', () => {
        const operatorControl = new FormControl<ThresholdOperator | null>(ThresholdOperator.GREATER_THAN);
        const valueControl = new FormControl('not-a-number');

        helper.applyThresholdConstraints({
            mode: 'edit',
            datapoint: numericDatapoint,
            thresholdOperatorControl: operatorControl,
            thresholdValueControl: valueControl,
        });

        expect(valueControl.errors?.['pattern']).toBeTruthy();
    });

    it('in edit mode senza metadati datapoint mantiene come ammesso solo l operatore corrente', () => {
        const operatorControl = new FormControl<ThresholdOperator | null>(ThresholdOperator.LESS_THAN);
        const valueControl = new FormControl('10');

        helper.applyThresholdConstraints({
            mode: 'edit',
            datapoint: null,
            thresholdOperatorControl: operatorControl,
            thresholdValueControl: valueControl,
        });

        operatorControl.setValue(ThresholdOperator.GREATER_THAN);
        operatorControl.updateValueAndValidity();

        expect(operatorControl.errors?.['unsupportedOperator']).toBe(true);
    });
});
