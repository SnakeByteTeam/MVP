import { FindDeviceByIdPort } from "../ports/out/find-device-by-id.port";
import { FindDeviceByPlantIdPort } from "../ports/out/find-device-by-plantid.port";
import { FindDeviceByIdCmd } from "../commands/find-device-by-id.command";
import { FindDeviceByPlantIdCmd } from "../commands/find-device-by-plantid.command";
import { Device } from "src/device/domain/models/device.model";
import { Datapoint } from "src/device/domain/models/datapoint.model";
import { DeviceService } from "./device.service"
import { FetchPlantStructurePort } from "../../../plant/application/ports/out/fetch-plant-structure.port";

describe('DeviceService', () => {
    let service: DeviceService; 
    let findByIdPort: jest.Mocked<FindDeviceByIdPort>;
    let findByPlantIdPort: jest.Mocked<FindDeviceByPlantIdPort>;

    beforeEach(() => {
        findByIdPort = {
            findById: jest.fn()
        }

        findByPlantIdPort = {
            findByPlantId: jest.fn()
        }

        service = new DeviceService(findByIdPort, findByPlantIdPort);
    }); 

    it('should return the same device that FindByIdPort returns', async () => {
        const cmd: FindDeviceByIdCmd = { id: 'device-123' };
        const returnedDevice: Device = new Device(
            'device-123',
            'plant-01',
            'living-room-light',
            'light',
            'dimmer',
            [
                new Datapoint('dp-1', 'brightness', true, true, 'number', ['0', '100'], 'slider'),
                new Datapoint('dp-2', 'power', true, true, 'boolean', ['on', 'off'], 'switch')
            ]
        );

        findByIdPort.findById.mockResolvedValue(returnedDevice);

        const device: Device = await service.findById(cmd);

        expect(findByIdPort.findById).toHaveBeenCalledWith(cmd);
        expect(findByIdPort.findById).toHaveBeenCalledTimes(1);
        expect(device).toBe(returnedDevice);
    });

    it('should return the same device array that FindByPlantIdPort returns', async () => {
        const cmd: FindDeviceByPlantIdCmd = { id: 'plant-01' };
        const returnedDevices: Device[] = [
            new Device(
                'device-123',
                'plant-01',
                'living-room-light',
                'light',
                'dimmer',
                [
                    new Datapoint('dp-1', 'brightness', true, true, 'number', ['0', '100'], 'slider')
                ]
            ),
            new Device(
                'device-124',
                'plant-01',
                'kitchen-light',
                'light',
                'switch',
                [
                    new Datapoint('dp-2', 'power', true, true, 'boolean', ['on', 'off'], 'switch')
                ]
            )
        ];

        findByPlantIdPort.findByPlantId.mockResolvedValue(returnedDevices);

        const devices: Device[] = await service.findByPlantId(cmd);

        expect(findByPlantIdPort.findByPlantId).toHaveBeenCalledWith(cmd);
        expect(findByPlantIdPort.findByPlantId).toHaveBeenCalledTimes(1);
        expect(devices).toBe(returnedDevices);
    });
})