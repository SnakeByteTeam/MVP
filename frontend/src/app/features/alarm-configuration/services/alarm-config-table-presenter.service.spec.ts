import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';
import type { AlarmRule } from '../../../core/alarm/models/alarm-rule.model';
import { AlarmDeviceCatalogService } from './alarm-device-catalog.service';
import { AlarmConfigTablePresenterService } from './alarm-config-table-presenter.service';

describe('AlarmConfigTablePresenterService', () => {
    let service: AlarmConfigTablePresenterService;
    let deviceCatalogStub: { getApartmentNameByDeviceId: (deviceId: string) => string | null };

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
    };

    beforeEach(() => {
        deviceCatalogStub = {
            getApartmentNameByDeviceId: (deviceId: string) => {
                if (deviceId === 'apt001-devA') {
                    return 'Appartamento 1';
                }

                if (deviceId === 'ward_12/sensor-A') {
                    return 'Appartamento Reparto 12';
                }

                return null;
            },
        };

        TestBed.configureTestingModule({
            providers: [
                AlarmConfigTablePresenterService,
                { provide: AlarmDeviceCatalogService, useValue: deviceCatalogStub },
            ],
        });

        service = TestBed.inject(AlarmConfigTablePresenterService);
    });

    it('mappa una regola in riga tabellare con soglia e orari formattati', () => {
        const row = service.toRows([baseRule])[0];

        expect(row).toEqual({
            id: 'rule-1',
            name: 'Temperatura alta',
            apartment: 'Appartamento 1',
            device: 'apt001-devA',
            priority: AlarmPriority.RED,
            threshold: '> 30',
            armingTime: '08:00',
            dearmingTime: '20:15',
            isEnabled: true,
        });
    });

    it('usa il catalog per valorizzare apartment quando il device e indicizzato', () => {
        const row = service.toRows([
            {
                ...baseRule,
                deviceId: 'ward_12/sensor-A',
            },
        ])[0];

        expect(row.apartment).toBe('Appartamento Reparto 12');
        expect(row.device).toBe('ward_12/sensor-A');
    });

    it('applica fallback su apartment quando il device non e presente nel catalog', () => {
        const row = service.toRows([
            {
                ...baseRule,
                deviceId: 'unknown-device',
            },
        ])[0];

        expect(row.apartment).toBe('-');
        expect(row.device).toBe('unknown-device');
    });

    it('applica fallback su apartment e device quando deviceId e vuoto', () => {
        const row = service.toRows([
            {
                ...baseRule,
                deviceId: '   ',
            },
        ])[0];

        expect(row.apartment).toBe('-');
        expect(row.device).toBe('-');
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
