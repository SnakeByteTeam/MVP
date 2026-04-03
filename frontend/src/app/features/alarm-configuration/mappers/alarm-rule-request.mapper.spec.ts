import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';
import type { AlarmRule } from '../../../core/alarm/models/alarm-rule.model';
import { ThresholdOperator } from '../../../core/alarm/models/threshold-operator.enum';
import type { AlarmConfigFormValue } from '../models/alarm-config-form-value.model';
import { AlarmRuleRequestMapper } from './alarm-rule-request.mapper';

describe('AlarmRuleRequestMapper', () => {
    let mapper: AlarmRuleRequestMapper;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AlarmRuleRequestMapper],
        });

        mapper = TestBed.inject(AlarmRuleRequestMapper);
    });

    it('toUpdateRequest include name e deviceId nel payload', () => {
        const formValue: AlarmConfigFormValue = {
            name: '  Soglia temperatura  ',
            plantId: 'plant-1',
            sensorId: '  DEV001  ',
            priority: AlarmPriority.ORANGE,
            thresholdOperator: ThresholdOperator.LESS_THAN,
            threshold: 12,
            armingTime: '07:15',
            dearmingTime: '22:45',
            enabled: true,
        };

        const result = mapper.toUpdateRequest(formValue);

        expect(result).toEqual({
            name: 'Soglia temperatura',
            deviceId: 'DEV001',
            priority: AlarmPriority.ORANGE,
            thresholdOperator: '<',
            thresholdValue: '12',
            armingTime: '07:15',
            dearmingTime: '22:45',
            isArmed: true,
        });
    });

    it('toToggleRequest include name e deviceId nel payload', () => {
        const rule: AlarmRule = {
            id: 'ALM001',
            name: 'Allarme umidita',
            deviceId: 'DEV002',
            priority: AlarmPriority.GREEN,
            thresholdOperator: '>',
            thresholdValue: '60',
            armingTime: '08:00:00',
            dearmingTime: '18:30:00',
            isArmed: true,
        };

        const result = mapper.toToggleRequest(rule, false);

        expect(result).toEqual({
            name: 'Allarme umidita',
            deviceId: 'DEV002',
            priority: AlarmPriority.GREEN,
            thresholdOperator: '>',
            thresholdValue: '60',
            armingTime: '08:00',
            dearmingTime: '18:30',
            isArmed: false,
        });
    });

    it('toToggleRequest fallisce se name e vuoto', () => {
        const invalidRule: AlarmRule = {
            id: 'ALM002',
            name: '   ',
            deviceId: 'DEV003',
            priority: AlarmPriority.RED,
            thresholdOperator: '=',
            thresholdValue: '45',
            armingTime: '00:00:00',
            dearmingTime: '23:59:00',
            isArmed: true,
        };

        expect(() => mapper.toToggleRequest(invalidRule, true)).toThrow('Campo obbligatorio mancante: name');
    });
});
