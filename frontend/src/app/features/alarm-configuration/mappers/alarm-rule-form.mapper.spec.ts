import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';
import type { AlarmRule } from '../../../core/alarm/models/alarm-rule.model';
import { ThresholdOperator } from '../../../core/alarm/models/threshold-operator.enum';
import { AlarmRuleFormMapper } from './alarm-rule-form.mapper';

describe('AlarmRuleFormMapper', () => {
    let mapper: AlarmRuleFormMapper;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AlarmRuleFormMapper],
        });

        mapper = TestBed.inject(AlarmRuleFormMapper);
    });

    it('mappa una regola numerica nel form value', () => {
        const rule: AlarmRule = {
            id: 'rule-1',
            name: 'Temperatura alta',
            thresholdOperator: '>',
            thresholdValue: '30',
            priority: AlarmPriority.RED,
            armingTime: '08:00:00',
            dearmingTime: '18:00:00',
            isArmed: true,
            deviceId: 'device-1',
            datapointId: 'dp-1',
            position: 'Appartamento 1 - Soggiorno - Sensore temperatura',
        };

        expect(mapper.toFormValue(rule)).toEqual({
            name: 'Temperatura alta',
            plantId: '',
            deviceId: 'device-1',
            datapointId: 'dp-1',
            priority: AlarmPriority.RED,
            thresholdOperator: ThresholdOperator.GREATER_THAN,
            thresholdValue: '30',
            armingTime: '08:00',
            dearmingTime: '18:00',
            enabled: true,
        });
    });

    it('mappa una regola booleana ON mantenendo operatore uguale', () => {
        const rule: AlarmRule = {
            id: 'rule-2',
            name: 'Allarme acceso',
            thresholdOperator: '=',
            thresholdValue: 'ON',
            priority: AlarmPriority.ORANGE,
            armingTime: '00:00:00',
            dearmingTime: '23:59:00',
            isArmed: false,
            deviceId: 'device-2',
            datapointId: 'dp-2',
            position: 'Appartamento 1 - Ingresso - Sensore porta',
        };

        expect(mapper.toFormValue(rule)).toEqual({
            name: 'Allarme acceso',
            plantId: '',
            deviceId: 'device-2',
            datapointId: 'dp-2',
            priority: AlarmPriority.ORANGE,
            thresholdOperator: ThresholdOperator.EQUAL_TO,
            thresholdValue: 'ON',
            armingTime: '00:00',
            dearmingTime: '23:59',
            enabled: false,
        });
    });

    it('mappa una regola booleana OFF mantenendo operatore uguale', () => {
        const rule: AlarmRule = {
            id: 'rule-3',
            name: 'Allarme spento',
            thresholdOperator: '=',
            thresholdValue: 'OFF',
            priority: AlarmPriority.GREEN,
            armingTime: '06:30:00',
            dearmingTime: '19:30:00',
            isArmed: true,
            deviceId: 'device-3',
            datapointId: 'dp-3',
            position: 'Appartamento 2 - Camera - Sensore finestra',
        };

        expect(mapper.toFormValue(rule)).toEqual({
            name: 'Allarme spento',
            plantId: '',
            deviceId: 'device-3',
            datapointId: 'dp-3',
            priority: AlarmPriority.GREEN,
            thresholdOperator: ThresholdOperator.EQUAL_TO,
            thresholdValue: 'OFF',
            armingTime: '06:30',
            dearmingTime: '19:30',
            enabled: true,
        });
    });

    it('mappa operatore >= come GREATER_THAN_OR_EQUAL', () => {
        const rule: AlarmRule = {
            id: 'rule-4',
            name: 'Temperatura minima',
            thresholdOperator: '>=',
            thresholdValue: '18',
            priority: AlarmPriority.WHITE,
            armingTime: '05:00:00',
            dearmingTime: '22:00:00',
            isArmed: true,
            deviceId: 'device-4',
            datapointId: 'dp-4',
            position: 'Appartamento 3 - Cucina - Sensore temperatura',
        };

        expect(mapper.toFormValue(rule).thresholdOperator).toBe(ThresholdOperator.GREATER_THAN_OR_EQUAL);
    });

    it('mappa operatore <= come LESS_THAN_OR_EQUAL', () => {
        const rule: AlarmRule = {
            id: 'rule-5',
            name: 'Temperatura massima',
            thresholdOperator: '<=',
            thresholdValue: '28',
            priority: AlarmPriority.WHITE,
            armingTime: '05:00:00',
            dearmingTime: '22:00:00',
            isArmed: false,
            deviceId: 'device-5',
            datapointId: 'dp-5',
            position: 'Appartamento 3 - Camera - Sensore temperatura',
        };

        expect(mapper.toFormValue(rule).thresholdOperator).toBe(ThresholdOperator.LESS_THAN_OR_EQUAL);
    });

    it('fallisce su operatori sconosciuti', () => {
        const rule: AlarmRule = {
            id: 'rule-6',
            name: 'Operatore custom',
            thresholdOperator: '!=',
            thresholdValue: 'foo',
            priority: AlarmPriority.RED,
            armingTime: '00:00:00',
            dearmingTime: '23:59:00',
            isArmed: true,
            deviceId: 'device-6',
            datapointId: 'dp-6',
            position: 'Appartamento 4 - Bagno - Sensore custom',
        };

        expect(() => mapper.toFormValue(rule)).toThrow('Operatore soglia non supportato: !=');
    });

});
