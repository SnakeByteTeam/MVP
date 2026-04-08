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
            deviceId: rule.deviceId,
            datapointId: rule.datapointId ?? '',
            priority: rule.priority,
            thresholdOperator: this.toFormThresholdOperator(rule.thresholdOperator),
            thresholdValue: rule.thresholdValue,
            armingTime: this.alarmTimeMapper.toFormTime(rule.armingTime),
            dearmingTime: this.alarmTimeMapper.toFormTime(rule.dearmingTime),
            enabled: rule.isArmed,
        };
    }

    private toFormThresholdOperator(operator: string): ThresholdOperator {
        const normalizedOperator = operator.trim();

        if (normalizedOperator === '>') {
            return ThresholdOperator.GREATER_THAN;
        }
        if (normalizedOperator === '>=') {
            return ThresholdOperator.GREATER_THAN_OR_EQUAL;
        }
        if (normalizedOperator === '<') {
            return ThresholdOperator.LESS_THAN;
        }
        if (normalizedOperator === '<=') {
            return ThresholdOperator.LESS_THAN_OR_EQUAL;
        }
        if (normalizedOperator === '=') {
            return ThresholdOperator.EQUAL_TO;
        }

        throw new Error(`Operatore soglia non supportato: ${operator}`);
    }
}