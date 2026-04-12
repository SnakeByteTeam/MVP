import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AlarmPriority } from 'src/app/core/alarm/models/alarm-priority.enum';
import type { AlarmRule } from 'src/app/core/alarm/models/alarm-rule.model';
import { ThresholdOperator } from 'src/app/core/alarm/models/threshold-operator.enum';
import type { AlarmConfigFormValue } from 'src/app/features/alarm-configuration/models/alarm-config-form-value.model';
import { AlarmRuleRequestMapper } from 'src/app/features/alarm-configuration/mappers/alarm-rule-request.mapper';

describe('AlarmRuleRequestMapper', () => {
    let mapper: AlarmRuleRequestMapper;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AlarmRuleRequestMapper],
        });

        mapper = TestBed.inject(AlarmRuleRequestMapper);
    });

    it('toUpdateRequest include i campi previsti dal contratto update', () => {
        const formValue: AlarmConfigFormValue = {
            name: '  Soglia temperatura  ',
            plantId: 'plant-1',
            deviceId: '  DEV001  ',
            datapointId: 'dp-1',
            priority: AlarmPriority.ORANGE,
            thresholdOperator: ThresholdOperator.LESS_THAN,
            thresholdValue: '12',
            armingTime: '07:15',
            dearmingTime: '22:45',
            enabled: true,
        };

        const result = mapper.toUpdateRequest(formValue);

        expect(result).toEqual({
            name: 'Soglia temperatura',
            priority: AlarmPriority.ORANGE,
            thresholdOperator: '<',
            thresholdValue: '12',
            armingTime: '07:15',
            dearmingTime: '22:45',
            isArmed: true,
        });
    });

    it('toUpdateRequest serializza operatore >= senza degradarlo', () => {
        const formValue: AlarmConfigFormValue = {
            name: 'Soglia minima',
            plantId: 'plant-1',
            deviceId: 'dev-77',
            datapointId: 'dp-2',
            priority: AlarmPriority.GREEN,
            thresholdOperator: ThresholdOperator.GREATER_THAN_OR_EQUAL,
            thresholdValue: '18',
            armingTime: '06:00',
            dearmingTime: '22:00',
            enabled: true,
        };

        const result = mapper.toUpdateRequest(formValue);
        expect(result.thresholdOperator).toBe('>=');
    });

    it('toCreateRequest serializza operatore <= senza degradarlo', () => {
        const formValue: AlarmConfigFormValue = {
            name: 'Soglia massima',
            plantId: 'plant-1',
            deviceId: 'dev-88',
            datapointId: 'dp-3',
            priority: AlarmPriority.ORANGE,
            thresholdOperator: ThresholdOperator.LESS_THAN_OR_EQUAL,
            thresholdValue: '26',
            armingTime: '06:00',
            dearmingTime: '22:00',
            enabled: true,
        };

        const result = mapper.toCreateRequest(formValue);
        expect(result.thresholdOperator).toBe('<=');
    });

    it('toCreateRequest normalizza soglia booleana in on/off', () => {
        const onFormValue: AlarmConfigFormValue = {
            name: 'Allarme acceso',
            plantId: 'plant-1',
            deviceId: 'dev-10',
            datapointId: 'dp-4',
            priority: AlarmPriority.RED,
            thresholdOperator: ThresholdOperator.EQUAL_TO,
            thresholdValue: 'ON',
            armingTime: '00:00',
            dearmingTime: '23:59',
            enabled: true,
        };

        const offFormValue: AlarmConfigFormValue = {
            ...onFormValue,
            name: 'Allarme spento',
            thresholdValue: 'OFF',
        };

        expect(mapper.toCreateRequest(onFormValue)).toMatchObject({
            plantId: 'plant-1',
            datapointId: 'dp-4',
            thresholdOperator: '=',
            thresholdValue: 'on',
        });
        expect(mapper.toCreateRequest(offFormValue)).toMatchObject({
            plantId: 'plant-1',
            datapointId: 'dp-4',
            thresholdOperator: '=',
            thresholdValue: 'off',
        });
    });

    it('toCreateRequest trimma i campi stringa principali', () => {
        const formValue: AlarmConfigFormValue = {
            name: '  Allarme trim  ',
            plantId: 'plant-1',
            deviceId: '  dev-42  ',
            datapointId: 'dp-5',
            priority: AlarmPriority.GREEN,
            thresholdOperator: ThresholdOperator.EQUAL_TO,
            thresholdValue: '  ON  ',
            armingTime: '06:00',
            dearmingTime: '23:00',
            enabled: true,
        };

        const result = mapper.toCreateRequest(formValue);

        expect(result).toMatchObject({
            name: 'Allarme trim',
            deviceId: 'dev-42',
            plantId: 'plant-1',
            datapointId: 'dp-5',
            thresholdOperator: '=',
            thresholdValue: 'on',
        });
    });

    it('toCreateRequest fallisce se thresholdValue e vuoto dopo trim', () => {
        const invalidFormValue: AlarmConfigFormValue = {
            name: 'Allarme invalido',
            plantId: 'plant-1',
            deviceId: 'dev-42',
            datapointId: 'dp-6',
            priority: AlarmPriority.GREEN,
            thresholdOperator: ThresholdOperator.EQUAL_TO,
            thresholdValue: '   ',
            armingTime: '06:00',
            dearmingTime: '23:00',
            enabled: true,
        };

        expect(() => mapper.toCreateRequest(invalidFormValue)).toThrow('Campo obbligatorio mancante: thresholdValue');
    });

    it('toCreateRequest fallisce se thresholdOperator e null', () => {
        const invalidFormValue: AlarmConfigFormValue = {
            name: 'Allarme invalido',
            plantId: 'plant-1',
            deviceId: 'dev-42',
            datapointId: 'dp-7',
            priority: AlarmPriority.GREEN,
            thresholdOperator: null,
            thresholdValue: '12',
            armingTime: '06:00',
            dearmingTime: '23:00',
            enabled: true,
        };

        expect(() => mapper.toCreateRequest(invalidFormValue)).toThrow('Campo obbligatorio mancante: thresholdOperator');
    });

    it('toToggleRequest include solo i campi previsti dal contratto update', () => {
        const rule: AlarmRule = {
            id: 'ALM001',
            name: 'Allarme umidita',
            deviceId: 'DEV002',
            datapointId: 'dp-8',
            priority: AlarmPriority.GREEN,
            thresholdOperator: '>=',
            thresholdValue: '60',
            armingTime: '08:00:00',
            dearmingTime: '18:30:00',
            isArmed: true,
            position: 'Appartamento 1 - Camera - Sensore umidita',
        };

        const result = mapper.toToggleRequest(rule, false);

        expect(result).toEqual({
            name: 'Allarme umidita',
            priority: AlarmPriority.GREEN,
            thresholdOperator: '>=',
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
            datapointId: 'dp-9',
            priority: AlarmPriority.RED,
            thresholdOperator: '=',
            thresholdValue: '45',
            armingTime: '00:00:00',
            dearmingTime: '23:59:00',
            isArmed: true,
            position: 'Appartamento 2 - Soggiorno - Sensore temperatura',
        };

        expect(() => mapper.toToggleRequest(invalidRule, true)).toThrow('Campo obbligatorio mancante: name');
    });

    it('toToggleRequest normalizza operatori con padding dal backend', () => {
        const rule: AlarmRule = {
            id: 'ALM003',
            name: 'Allarme temperatura',
            deviceId: 'DEV004',
            datapointId: 'dp-10',
            priority: AlarmPriority.ORANGE,
            thresholdOperator: '> ',
            thresholdValue: '27',
            armingTime: '05:00:00',
            dearmingTime: '23:00:00',
            isArmed: true,
            position: 'Appartamento 3 - Ingresso - Sensore temperatura',
        };

        const result = mapper.toToggleRequest(rule, false);

        expect(result.thresholdOperator).toBe('>');
    });
});
