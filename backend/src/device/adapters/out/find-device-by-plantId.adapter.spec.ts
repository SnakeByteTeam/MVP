import { DeviceMapperRepoPort } from "src/device/application/repository/device-mapper.repository";
import { FindDeviceByPlantIdAdapter } from "./find-device-by-plantId.adapter";
import { FindDeviceByPlantIdRepoPort } from "src/device/application/repository/find-device-by-plantId.repository";
import { DeviceEntity } from "src/device/infrastructure/entities/device.entity";
import { Device } from "src/device/domain/models/device.model";
import { Datapoint } from "src/device/domain/models/datapoint.model";
import { FindDeviceByIdCmd } from "src/device/application/commands/find-device-by-id.command";


describe('FindByDeviceIdAdapter', () => {
    let adapter: FindDeviceByPlantIdAdapter;
    let repoPort: jest.Mocked<FindDeviceByPlantIdRepoPort>;
    let mapper: jest.Mocked<DeviceMapperRepoPort>;

    beforeEach(() => {
        repoPort = {
            findByPlantId: jest.fn()
        }

        mapper = {
            toDomain: jest.fn()
        }

        adapter = new FindDeviceByPlantIdAdapter(mapper, repoPort);
    });

    it('should return a device array when succeed', async () => {
        const deviceEntity: DeviceEntity[] = [
            {
                id: '123',
                name: 'living-room-light',
                plantId: 'plant-01',
                type: 'light',
                subType: 'dimmer',
                datapoints: [
                    {
                        id: '456',
                        name: 'brightness',
                        readable: true,
                        writable: true,
                        valueType: 'number',
                        enum: ['0', '100'],
                        sfeType: 'slider'
                    },
                    {
                        id: '457',
                        name: 'power',
                        readable: true,
                        writable: true,
                        valueType: 'boolean',
                        enum: ['on', 'off'],
                        sfeType: 'switch'
                    }
                ]
            },
            {
                id: '124',
                name: 'kitchen-light',
                plantId: 'plant-01',
                type: 'light',
                subType: 'switch',
                datapoints: [
                    {
                        id: '458',
                        name: 'power',
                        readable: true,
                        writable: true,
                        valueType: 'boolean',
                        enum: ['on', 'off'],
                        sfeType: 'switch'
                    }
                ]
            }
        ];

        const expectedDeviceA: Device = new Device(
            '123',
            'plant-01',
            'living-room-light',
            'light',
            'dimmer',
            [
                new Datapoint('456', 'datapoint-1', true, false, 'string', ['on', 'off'], 'light'),
                new Datapoint('457', 'datapoint-2', true, false, 'string', ['on', 'off'], 'light')
            ]
        );

        const expectedDeviceB: Device = new Device(
            '124',
            'plant-01',
            'kitchen-light',
            'light',
            'switch',
            [
                new Datapoint('458', 'datapoint-3', true, false, 'string', ['on', 'off'], 'light')
            ]
        );

        const expectedDevices: Device[] = [expectedDeviceA, expectedDeviceB];

        repoPort.findByPlantId.mockResolvedValue(deviceEntity);
        mapper.toDomain.mockReturnValueOnce(expectedDeviceA);
        mapper.toDomain.mockReturnValueOnce(expectedDeviceB);

        const devices: Device[] = await adapter.findByPlantId({id: 'plant-01'});

        expect(devices).toEqual(expectedDevices);
        expect(devices).toHaveLength(2);
        expect(devices.map((d) => d.getId())).toEqual(['123', '124']);
        expect(devices.map((d) => d.getName())).toEqual(['living-room-light', 'kitchen-light']);
        expect(devices.map((d) => d.getPlantId())).toEqual(['plant-01', 'plant-01']);
        expect(devices.map((d) => d.getType())).toEqual(['light', 'light']);
        expect(devices.map((d) => d.getSubType())).toEqual(['dimmer', 'switch']);
        expect(repoPort.findByPlantId).toHaveBeenCalledWith('plant-01');
        expect(repoPort.findByPlantId).toHaveBeenCalledTimes(1);
        expect(mapper.toDomain).toHaveBeenNthCalledWith(1, deviceEntity[0]);
        expect(mapper.toDomain).toHaveBeenNthCalledWith(2, deviceEntity[1]);
        expect(mapper.toDomain).toHaveBeenCalledTimes(2);
       
    });

    it('should throw a Id is null error when command\'id is absent', async () => {
        await expect(adapter.findByPlantId(null as unknown as FindDeviceByIdCmd)).rejects.toThrow(Error('PlantId is null'));
    });

    it('should throw a Id is null error when command\'id is absent', async () => {
        await expect(adapter.findByPlantId({id: null} as unknown as FindDeviceByIdCmd)).rejects.toThrow(Error('PlantId is null'));
    });

    it('should throw a Id is null error when command\'id is absent', async () => {
        await expect(adapter.findByPlantId({id: ''} as unknown as FindDeviceByIdCmd)).rejects.toThrow(Error('PlantId is null'));
    });

    it('should return a Device not found error when the device can\'t be found', async () => {
        repoPort.findByPlantId.mockResolvedValue(null);

        await expect(adapter.findByPlantId({id: '123'})).rejects.toThrow(Error('Plant 123 not found'));
    });
});