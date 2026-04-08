import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ThresholdOperator } from '../../../core/alarm/models/threshold-operator.enum';
import { Datapoint } from '../../apartment-monitor/models/datapoint.model';
import { DeviceDatapointExtractionService } from '../services/device-datapoint-extraction.service';

export type ApplyThresholdConstraintsParams = {
    mode: 'create' | 'edit';
    datapoint: Datapoint | null;
    thresholdOperatorControl: AbstractControl;
    thresholdValueControl: AbstractControl;
};

@Injectable({ providedIn: 'root' })
export class AlarmConfigFormValidationHelper {
    constructor(private readonly datapointExtraction: DeviceDatapointExtractionService) { }

    public applyThresholdConstraints({
        mode,
        datapoint,
        thresholdOperatorControl,
        thresholdValueControl,
    }: ApplyThresholdConstraintsParams): void {
        const allowedOperators = this.resolveAllowedOperators(
            mode,
            datapoint,
            thresholdOperatorControl.value as ThresholdOperator | null,
        );

        thresholdOperatorControl.setValidators([
            Validators.required,
            this.operatorAllowedValidator(allowedOperators),
        ]);

        if (datapoint === null) {
            thresholdValueControl.setValidators([Validators.required]);
        } else if (this.datapointExtraction.usesEnumeratedThreshold(datapoint)) {
            const enumValues = this.datapointExtraction.getEnumValues(datapoint);
            thresholdValueControl.setValidators([
                Validators.required,
                this.enumThresholdValidator(enumValues),
            ]);

            const normalizedValue = this.datapointExtraction.normalizeThresholdValue(
                datapoint,
                String(thresholdValueControl.value ?? ''),
            );
            if (normalizedValue !== thresholdValueControl.value) {
                thresholdValueControl.setValue(normalizedValue, { emitEvent: false });
            }
        } else {
            thresholdValueControl.setValidators([
                Validators.required,
                Validators.pattern(/^[+-]?\d+([.]\d+)?$/),
            ]);
        }

        if (
            thresholdOperatorControl.value !== null &&
            !allowedOperators.includes(thresholdOperatorControl.value as ThresholdOperator)
        ) {
            thresholdOperatorControl.setValue(null, { emitEvent: false });
        }

        thresholdOperatorControl.updateValueAndValidity({ emitEvent: false });
        thresholdValueControl.updateValueAndValidity({ emitEvent: false });
    }

    private resolveAllowedOperators(
        mode: 'create' | 'edit',
        datapoint: Datapoint | null,
        currentOperator: ThresholdOperator | null,
    ): ThresholdOperator[] {
        if (datapoint !== null) {
            return this.datapointExtraction.getAllowedOperators(datapoint);
        }

        if (mode === 'edit' && currentOperator !== null) {
            return [currentOperator];
        }

        return Object.values(ThresholdOperator);
    }

    private operatorAllowedValidator(allowedOperators: readonly ThresholdOperator[]): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value as ThresholdOperator | null;
            if (value === null) {
                return null;
            }

            return allowedOperators.includes(value) ? null : { unsupportedOperator: true };
        };
    }

    private enumThresholdValidator(enumValues: readonly string[]): ValidatorFn {
        const normalizedEnumValues = new Set(enumValues.map((enumValue) => enumValue.toLowerCase()));

        return (control: AbstractControl): ValidationErrors | null => {
            const value = String(control.value ?? '').trim();
            if (value.length === 0) {
                return null;
            }

            return normalizedEnumValues.has(value.toLowerCase())
                ? null
                : { invalidEnumThreshold: true };
        };
    }
}
