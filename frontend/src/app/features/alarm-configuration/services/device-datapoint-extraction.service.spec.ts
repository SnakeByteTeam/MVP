import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThresholdOperator } from '../../../core/alarm/models/threshold-operator.enum';
import { DeviceType } from '../../device-interaction/models/device-type.enum';
import type { Apartment } from '../../apartment-monitor/models/apartment.model';
import type { Datapoint } from '../../apartment-monitor/models/datapoint.model';
import type { PlantDto } from '../../apartment-monitor/models/plant-response.model';
import { DeviceDatapointExtractionService } from './device-datapoint-extraction.service';

describe('DeviceDatapointExtractionService', () => {
    let service: DeviceDatapointExtractionService;

    const enumDatapoint: Datapoint = {
        id: 'dp-1',
        name: 'SFE_State_OnOff',
        readable: true,
        writable: false,
        valueType: 'string',
        enum: ['Off', 'On', 'Off'],
        sfeType: 'SFE_State_OnOff',
    };

    const numericDatapoint: Datapoint = {
        id: 'dp-2',
        name: 'SFE_State_Temperature',
        readable: true,
        writable: false,
        valueType: 'string',
        enum: [],
        sfeType: 'SFE_State_Temperature',
    };

    const apartment: Apartment = {
        id: 'plant-1',
        name: 'Appartamento demo',
        isEnabled: true,
        rooms: [
            {
                id: 'room-1',
                name: 'Soggiorno',
                hasActiveAlarm: false,
                devices: [
                    {
                        id: 'dev-1',
                        name: 'Sensore UWB',
                        type: DeviceType.PRESENCE_SENSOR,
                        status: 'ONLINE',
                        actions: [],
                        datapoints: [
                            enumDatapoint,
                            {
                                ...enumDatapoint,
                                id: 'dp-3',
                                name: 'SFE_Cmd_OnOff',
                                readable: false,
                                writable: true,
                            },
                            numericDatapoint,
                        ],
                    },
                ],
            },
        ],
    };

    const plantCatalog: PlantDto[] = [
        {
            id: 'plant-1',
            name: 'Appartamento demo',
            rooms: [
                {
                    id: 'room-1',
                    name: 'Soggiorno',
                    devices: [
                        {
                            id: 'dev-1',
                            name: 'Sensore UWB',
                            datapoints: [
                                {
                                    id: 'dp-lookup',
                                    name: 'SFE_State_OnOff',
                                    readable: true,
                                    writable: false,
                                    valueType: 'string',
                                    enum: ['Off', 'On', 'On'],
                                    sfeType: 'SFE_State_OnOff',
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [DeviceDatapointExtractionService] });
        service = TestBed.inject(DeviceDatapointExtractionService);
    });

    it('extractDeviceOptions crea label stanza-dispositivo e normalizza enum duplicati', () => {
        const options = service.extractDeviceOptions(apartment);

        expect(options).toHaveLength(1);
        expect(options[0].id).toBe('dev-1');
        expect(options[0].label).toBe('Soggiorno - Sensore UWB');
        expect(options[0].datapoints[0].enum).toEqual(['Off', 'On']);
    });

    it('findReadableDatapoints ritorna solo datapoint leggibili', () => {
        const options = service.extractDeviceOptions(apartment);

        const datapoints = service.findReadableDatapoints('dev-1', options);

        expect(datapoints.map((datapoint) => datapoint.id)).toEqual(['dp-1', 'dp-2']);
        expect(datapoints.every((datapoint) => datapoint.readable)).toBe(true);
    });

    it('findReadableDatapoints ritorna lista vuota se il device non esiste', () => {
        const options = service.extractDeviceOptions(apartment);

        const datapoints = service.findReadableDatapoints('missing-device', options);

        expect(datapoints).toEqual([]);
    });

    it('getAllowedOperators limita a uguale quando il datapoint ha enum', () => {
        expect(service.getAllowedOperators(enumDatapoint)).toEqual([ThresholdOperator.EQUAL_TO]);
        expect(service.getAllowedOperators(numericDatapoint)).toEqual([
            ThresholdOperator.GREATER_THAN,
            ThresholdOperator.GREATER_THAN_OR_EQUAL,
            ThresholdOperator.LESS_THAN,
            ThresholdOperator.LESS_THAN_OR_EQUAL,
            ThresholdOperator.EQUAL_TO,
        ]);
    });

    it('isThresholdValueValid valida enum case-insensitive e soglie numeriche', () => {
        expect(service.isThresholdValueValid(enumDatapoint, 'on')).toBe(true);
        expect(service.isThresholdValueValid(enumDatapoint, 'Unknown')).toBe(false);
        expect(service.isThresholdValueValid(numericDatapoint, '10.5')).toBe(true);
        expect(service.isThresholdValueValid(numericDatapoint, 'abc')).toBe(false);
    });

    it('findDatapointByDeviceAndDatapointId trova e normalizza il datapoint dal catalogo plant', () => {
        const datapoint = service.findDatapointByDeviceAndDatapointId(plantCatalog, 'dev-1', 'dp-lookup');

        expect(datapoint).not.toBeNull();
        expect(datapoint?.id).toBe('dp-lookup');
        expect(datapoint?.enum).toEqual(['Off', 'On']);
    });

    it('findDatapointByDeviceAndDatapointId ritorna null se non trova corrispondenze', () => {
        const datapoint = service.findDatapointByDeviceAndDatapointId(plantCatalog, 'dev-missing', 'dp-lookup');

        expect(datapoint).toBeNull();
    });
});
