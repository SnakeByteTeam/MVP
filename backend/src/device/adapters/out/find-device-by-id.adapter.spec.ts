import { DeviceMapperRepoPort } from "src/device/application/repository/device-mapper.repository";
import { FindDeviceByIdAdapter } from "./find-device-by-id.adapter";
import { FindDeviceByIdRepoPort } from "src/device/application/repository/find-device-by-id.repository";
import { DeviceEntity } from "src/device/infrastructure/entities/device.entity";
import { Device } from "src/device/domain/models/device.model";
import { Datapoint } from "src/device/domain/models/datapoint.model";
import { FindDeviceByIdCmd } from "src/device/application/commands/find-device-by-id.command";


describe('FindByDeviceIdAdapter', () => {
    let adapter: FindDeviceByIdAdapter;
    let repoPort: jest.Mocked<FindDeviceByIdRepoPort>;
    let mapper: jest.Mocked<DeviceMapperRepoPort>;

    beforeEach(() => {
        repoPort = {
            findById: jest.fn()
        }

        mapper = {
            toDomain: jest.fn()
        }

        adapter = new FindDeviceByIdAdapter(mapper, repoPort);
    });

    it('should return a device when succeed', async () => {
        const deviceEntity: DeviceEntity = {
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
        };

        const expectedDevice: Device = new Device(
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

        repoPort.findById.mockResolvedValue(deviceEntity);
        mapper.toDomain.mockReturnValue(expectedDevice);

        const device: Device = await adapter.findById({id: '123'});

        expect(device).toEqual(expectedDevice);
        expect(device.getId()).toBe('123');
        expect(device.getName()).toBe('living-room-light');
        expect(device.getPlantId()).toBe('plant-01');
        expect(device.getType()).toBe('light');
        expect(device.getSubType()).toBe('dimmer');
        expect(repoPort.findById).toHaveBeenCalledWith('123');
        expect(repoPort.findById).toHaveBeenCalledTimes(1);
        expect(mapper.toDomain).toHaveBeenCalledWith(deviceEntity);
        expect(mapper.toDomain).toHaveBeenCalledTimes(1);
       
    });

    it('should throw a Id is null error when command\'id is absent', async () => {
        await expect(adapter.findById(null as unknown as FindDeviceByIdCmd)).rejects.toThrow(Error('Id is null'));
    });

    it('should throw a Id is null error when command\'id is absent', async () => {
        await expect(adapter.findById({id: null} as unknown as FindDeviceByIdCmd)).rejects.toThrow(Error('Id is null'));
    });

    it('should throw a Id is null error when command\'id is absent', async () => {
        await expect(adapter.findById({id: ''} as unknown as FindDeviceByIdCmd)).rejects.toThrow(Error('Id is null'));
    });

    it('should return a Device not found error when the device can\'t be found', async () => {
        repoPort.findById.mockResolvedValue(null);

        await expect(adapter.findById({id: '123'})).rejects.toThrow(Error('Device 123 not found'));
    });
});