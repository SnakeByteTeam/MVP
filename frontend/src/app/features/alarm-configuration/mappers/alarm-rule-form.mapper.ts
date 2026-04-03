import { Injectable, inject } from '@angular/core';
import { AlarmRule } from '../../../core/alarm/models/alarm-rule.model';
import { ThresholdOperator } from '../../../core/alarm/models/threshold-operator.enum';
import { AlarmConfigFormValue } from '../models/alarm-config-form-value.model';
import { AlarmTimeMapper } from './alarm-time.mapper';

@Injectable({ providedIn: 'root' })
export class AlarmRuleFormMapper {
    private readonly alarmTimeMapper = inject(AlarmTimeMapper);

    public toFormValue(rule: AlarmRule): AlarmConfigFormValue {
        return {
            name: rule.name,
            plantId: '',
            sensorId: rule.deviceId,
            priority: rule.priority,
            thresholdOperator: this.toFormThresholdOperator(rule.thresholdOperator),
            threshold: this.toFormThreshold(rule.thresholdValue),
            armingTime: this.alarmTimeMapper.toFormTime(rule.armingTime),
            dearmingTime: this.alarmTimeMapper.toFormTime(rule.dearmingTime),
            enabled: rule.isArmed,
        };
    }

    private toFormThresholdOperator(operator: string): ThresholdOperator {
        if (operator === '>' || operator === '>=') {
            return ThresholdOperator.GREATER_THAN;
        }
        if (operator === '<' || operator === '<=') {
            return ThresholdOperator.LESS_THAN;
        }

        return ThresholdOperator.EQUAL_TO;
    }

    private toFormThreshold(value: string): number {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
}