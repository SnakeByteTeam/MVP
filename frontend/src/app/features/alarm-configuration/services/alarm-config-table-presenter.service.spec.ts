import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';
import type { AlarmRule } from '../../../core/alarm/models/alarm-rule.model';
import { AlarmConfigTablePresenterService } from './alarm-config-table-presenter.service';

describe('AlarmConfigTablePresenterService', () => {
    let service: AlarmConfigTablePresenterService;

    const baseRule: AlarmRule = {
        id: 'rule-1',
        name: 'Temperatura alta',
        thresholdOperator: '>',
        thresholdValue: '30',
        priority: AlarmPriority.RED,
        armingTime: '08:00:00',
        dearmingTime: '20:15:00',
        isArmed: true,
        deviceId: 'apt001-devA',
        position: 'Appartamento 1 - Soggiorno - Sensore A',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AlarmConfigTablePresenterService],
        });

        service = TestBed.inject(AlarmConfigTablePresenterService);
    });

    it('mappa una regola in riga tabellare con soglia e orari formattati', () => {
        const row = service.toRows([baseRule])[0];

        expect(row).toEqual({
            id: 'rule-1',
            name: 'Temperatura alta',
            position: 'Appartamento 1 - Soggiorno - Sensore A',
            priority: AlarmPriority.RED,
            threshold: '> 30',
            armingTime: '08:00',
            dearmingTime: '20:15',
            isEnabled: true,
        });
    });

    it('normalizza gli spazi intorno ai separatori della posizione', () => {
        const row = service.toRows([
            {
                ...baseRule,
                position: 'Appartamento 2-  Cucina -Sensore fumo',
            },
        ])[0];

        expect(row.position).toBe('Appartamento 2 - Cucina - Sensore fumo');
    });

    it('applica fallback su posizione quando e vuota', () => {
        const row = service.toRows([
            {
                ...baseRule,
                position: '   ',
            },
        ])[0];

        expect(row.position).toBe('-');
    });

    it('mantiene fallback orario quando il valore non e ISO/HH:mm:ss', () => {
        const row = service.toRows([
            {
                ...baseRule,
                armingTime: 'xx:yy:zz',
                dearmingTime: 'foo',
            },
        ])[0];

        expect(row.armingTime).toBe('xx:yy');
        expect(row.dearmingTime).toBe('foo');
    });
});
