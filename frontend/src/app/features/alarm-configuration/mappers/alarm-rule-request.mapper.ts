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
    private readonly hourMinutePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    public toCreateRequest(formValue: AlarmConfigFormValue): CreateAlarmRuleRequestDto {
        return {
            name: this.requireNonEmptyString(formValue.name, 'name'),
            deviceId: this.requireNonEmptyString(formValue.sensorId, 'sensorId'),
            plantId: this.requireNonEmptyString(formValue.plantId, 'plantId'),
            priority: this.toPriorityNumber(formValue.priority),
            thresholdOperator: this.toThresholdOperatorCode(formValue.thresholdOperator),
            thresholdValue: this.toRequestThresholdValue(formValue.thresholdValue, 'thresholdValue'),
            armingTime: this.requireHourMinuteString(formValue.armingTime, 'armingTime'),
            dearmingTime: this.requireHourMinuteString(formValue.dearmingTime, 'dearmingTime'),
        };
    }

    public toUpdateRequest(formValue: AlarmConfigFormValue): UpdateAlarmRuleRequestDto {
        return {
            name: this.requireNonEmptyString(formValue.name, 'name'),
            priority: this.toPriorityNumber(formValue.priority),
            thresholdOperator: this.toThresholdOperatorCode(formValue.thresholdOperator),
            thresholdValue: this.toRequestThresholdValue(formValue.thresholdValue, 'thresholdValue'),
            armingTime: this.requireHourMinuteString(formValue.armingTime, 'armingTime'),
            dearmingTime: this.requireHourMinuteString(formValue.dearmingTime, 'dearmingTime'),
            isArmed: formValue.enabled,
        };
    }

    public toToggleRequest(rule: AlarmRule, isArmed: boolean): UpdateAlarmRuleRequestDto {
        return {
            name: this.requireNonEmptyString(rule.name, 'name'),
            priority: rule.priority,
            thresholdOperator: this.requireThresholdOperator(rule.thresholdOperator),
            thresholdValue: this.toRequestThresholdValue(rule.thresholdValue, 'thresholdValue'),
            armingTime: this.requireHourMinuteString(this.alarmTimeMapper.toFormTime(rule.armingTime), 'armingTime'),
            dearmingTime: this.requireHourMinuteString(this.alarmTimeMapper.toFormTime(rule.dearmingTime), 'dearmingTime'),
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
        if (requiredOperator === ThresholdOperator.GREATER_THAN_OR_EQUAL) {
            return '>=';
        }
        if (requiredOperator === ThresholdOperator.LESS_THAN) {
            return '<';
        }
        if (requiredOperator === ThresholdOperator.LESS_THAN_OR_EQUAL) {
            return '<=';
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

    private requireHourMinuteString(value: string, fieldName: string): string {
        const required = this.requireNonEmptyString(value, fieldName);
        if (!this.hourMinutePattern.test(required)) {
            throw new Error(`Formato non valido per ${fieldName}`);
        }

        return required;
    }

    private requireThresholdOperator(operator: string): string {
        const required = this.requireNonEmptyString(operator, 'thresholdOperator');
        if (required === '>' || required === '<' || required === '>=' || required === '<=' || required === '=') {
            return required;
        }

        throw new Error('Campo obbligatorio mancante: thresholdOperator');
    }

    private toRequestThresholdValue(value: string, fieldName: string): string {
        const required = this.requireNonEmptyString(value, fieldName);
        const normalized = required.toLowerCase();
        if (normalized === 'on' || normalized === 'true') {
            return 'on';
        }
        if (normalized === 'off' || normalized === 'false') {
            return 'off';
        }

        return required;
    }
}