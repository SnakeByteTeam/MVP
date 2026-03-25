import { Pool } from 'pg';
import { DeviceRepositoryImpl } from './device-repository-impl';
import { DeviceEntity } from '../entities/device.entity';

describe('DeviceRepositoryImpl', () => {
    let deviceRepo: DeviceRepositoryImpl;
    let pool: jest.Mocked<Pick<Pool, 'connect'>>;
    let queryMock: jest.Mock;
    let releaseMock: jest.Mock;

    beforeEach(() => {
        queryMock = jest.fn();
        releaseMock = jest.fn();

        pool = {
        connect: jest.fn().mockResolvedValue({
            query: queryMock,
            release: releaseMock,
        }),
        };

        deviceRepo = new DeviceRepositoryImpl(pool as unknown as Pool);
    });

    it('should return a DeviceEntity when query by id succeed', async () => {
        const mockedDevice: DeviceEntity = {
            id: 'fct-012923FAB00624-1090564616',
            name: 'Luci Soggiorno',
            plantId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            type: 'SF_Light',
            subType: 'SS_Light_Switch',
            datapoints: [
                {
                    id: 'dp-012923FAB00624-1090564616-SFE_Cmd_OnOff',
                    name: 'SFE_Cmd_OnOff',
                    readable: false,
                    writable: true,
                    valueType: 'string',
                    enum: ['Off', 'On'],
                    sfeType: 'SFE_Cmd_OnOff',
                },
            ],
        };

        queryMock.mockResolvedValue({
            rows: [{ device: mockedDevice }],
        });

        const result = await deviceRepo.findById('fct-012923FAB00624-1090564616');

        expect(queryMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockedDevice);
    });

    it('should return DeviceEntity array when query by plant id succeed', async () => {
        const mockedDevices: DeviceEntity[] = [
            {
                id: 'fct-012923FAB00624-1090564616',
                name: 'Luci Soggiorno',
                plantId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                type: 'SF_Light',
                subType: 'SS_Light_Switch',
                datapoints: [
                    {
                        id: 'dp-012923FAB00624-1090564616-SFE_Cmd_OnOff',
                        name: 'SFE_Cmd_OnOff',
                        readable: false,
                        writable: true,
                        valueType: 'string',
                        enum: ['Off', 'On'],
                        sfeType: 'SFE_Cmd_OnOff',
                    },
                ],
            },
            {
                id: 'fct-012923FAB00624-2090564617',
                name: 'Termostato Soggiorno',
                plantId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                type: 'SF_Thermostat',
                subType: 'SS_Thermostat',
                datapoints: [
                    {
                        id: 'dp-012923FAB00624-2090564617-SFE_Cmd_Temp',
                        name: 'SFE_Cmd_Temp',
                        readable: false,
                        writable: true,
                        valueType: 'number',
                        enum: [],
                        sfeType: 'SFE_Cmd_Temp',
                    },
                ],
            },
        ];

        queryMock.mockResolvedValue({
            rows: mockedDevices.map((device) => ({ device })),
        });

        const result = await deviceRepo.findByPlantId('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
        expect(result).toEqual(mockedDevices);
    });

    it('should return null when the query is empty', async () => {
        queryMock.mockResolvedValue({rows: []});

        const result = await deviceRepo.findById('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

        expect(result).toBeNull();
    });

    it('should return null when the query is empty', async () => {
        queryMock.mockResolvedValue({rows: []});

        const result = await deviceRepo.findByPlantId('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

        expect(result).toBeNull();
    });

    it('should throw an error when query fails', async () => {
        queryMock.mockRejectedValue(new Error('db down'));

        await expect(deviceRepo.findById('fct-012923FAB00624-1090564616')).rejects.toThrow(
            'Database error: db down',
        );
    });

    it('should throw an error when query fails', async () => {
        queryMock.mockRejectedValue(new Error('db down'));

        await expect(deviceRepo.findByPlantId('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')).rejects.toThrow(
            'Database error: db down',
        );
    });
});