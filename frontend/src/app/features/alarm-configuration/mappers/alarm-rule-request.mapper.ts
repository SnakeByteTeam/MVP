import { Injectable, inject } from '@angular/core';
import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';
import { AlarmRule } from '../../../core/alarm/models/alarm-rule.model';
import { ThresholdOperator } from '../../../core/alarm/models/threshold-operator.enum';
import { CreateAlarmRuleRequestDto } from '../../../core/alarm/models/dto/create-alarm-rule-request.model.dto';
import { UpdateAlarmRuleRequestDto } from '../../../core/alarm/models/dto/update-alarm-rule-request.model.dto';
import { AlarmConfigFormValue } from '../models/alarm-config-form-value.model';
import { AlarmTimeMapper } from './alarm-time.mapper';

@Injectable({ providedIn: 'root' })
export class AlarmRuleRequestMapper {
    private readonly alarmTimeMapper = inject(AlarmTimeMapper);

    public toCreateRequest(formValue: AlarmConfigFormValue): CreateAlarmRuleRequestDto {
        return {
            name: this.requireNonEmptyString(formValue.name, 'name'),
            deviceId: this.requireNonEmptyString(formValue.sensorId, 'sensorId'),
            priority: this.toPriorityNumber(formValue.priority),
            thresholdOperator: this.toThresholdOperatorCode(formValue.thresholdOperator),
            thresholdValue: this.requireNonEmptyString(formValue.thresholdValue, 'thresholdValue'),
            armingTime: formValue.armingTime,
            dearmingTime: formValue.dearmingTime,
        };
    }

    public toUpdateRequest(formValue: AlarmConfigFormValue): UpdateAlarmRuleRequestDto {
        return {
            name: this.requireNonEmptyString(formValue.name, 'name'),
            deviceId: this.requireNonEmptyString(formValue.sensorId, 'sensorId'),
            priority: this.toPriorityNumber(formValue.priority),
            thresholdOperator: this.toThresholdOperatorCode(formValue.thresholdOperator),
            thresholdValue: this.requireNonEmptyString(formValue.thresholdValue, 'thresholdValue'),
            armingTime: formValue.armingTime,
            dearmingTime: formValue.dearmingTime,
            isArmed: formValue.enabled,
        };
    }

    public toToggleRequest(rule: AlarmRule, isArmed: boolean): UpdateAlarmRuleRequestDto {
        return {
            name: this.requireNonEmptyString(rule.name, 'name'),
            deviceId: this.requireNonEmptyString(rule.deviceId, 'deviceId'),
            priority: rule.priority,
            thresholdOperator: rule.thresholdOperator,
            thresholdValue: rule.thresholdValue,
            armingTime: this.alarmTimeMapper.toFormTime(rule.armingTime),
            dearmingTime: this.alarmTimeMapper.toFormTime(rule.dearmingTime),
            isArmed,
        };
    }

    private toPriorityNumber(priority: AlarmPriority | null): number {
        return this.requireField(priority, 'priority');
    }

    private toThresholdOperatorCode(operator: ThresholdOperator | null): string {
        const requiredOperator = this.requireField(operator, 'thresholdOperator');
        if (requiredOperator === ThresholdOperator.GREATER_THAN) {
            return '>';
        }
        if (requiredOperator === ThresholdOperator.LESS_THAN) {
            return '<';
        }

        return '=';
    }

    private requireField<T>(value: T | null, fieldName: string): T {
        if (value === null) {
            throw new Error(`Campo obbligatorio mancante: ${fieldName}`);
        }

        return value;
    }

    private requireNonEmptyString(value: string, fieldName: string): string {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            throw new Error(`Campo obbligatorio mancante: ${fieldName}`);
        }

        return trimmed;
    }
}