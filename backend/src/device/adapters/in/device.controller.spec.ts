import { DeviceController } from './device.controller';
import { FindDeviceByIdUseCase } from 'src/device/application/ports/in/find-device-by-id.usecase';
import { FindDeviceByPlantIdUseCase } from 'src/device/application/ports/in/find-device-by-plantid.usecase';
import { Device } from 'src/device/domain/models/device.model';
import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { DeviceDto } from 'src/device/infrastructure/http/dtos/device.dto';
import { DatapointDto } from 'src/device/infrastructure/http/dtos/datapoint.dto';
import { InternalServerErrorException } from '@nestjs/common';

describe('DeviceController', () => {
  let controller: DeviceController;
  let findDeviceById: jest.Mocked<FindDeviceByIdUseCase>;
  let findDeviceByPlantId: jest.Mocked<FindDeviceByPlantIdUseCase>;

  beforeEach(() => {
    findDeviceById = {
      findById: jest.fn(),
    };

    findDeviceByPlantId = {
      findByPlantId: jest.fn(),
    };

    controller = new DeviceController(findDeviceById, findDeviceByPlantId);
  });

  it('should return device dto when requested by id, correctly converted into a dto', async () => {
    const returnedDatapoints: Datapoint[] = [
      new Datapoint(
        '456',
        'topolino',
        true,
        false,
        'number',
        ['on', 'off'],
        'ciao',
      ),
    ];
    const returnedDevice: Device = new Device(
      '123',
      '123',
      'pippo',
      'luce',
      'luce',
      returnedDatapoints,
    );

    findDeviceById.findById.mockResolvedValue(returnedDevice);

    const deviceDto: DeviceDto = await controller.findById('123');
    const datapointsDto: DatapointDto[] = deviceDto.datapoints;

    const expectedDatapointsDto: DatapointDto[] = returnedDatapoints.map(
      (datapoint) => ({
        id: datapoint.getId(),
        name: datapoint.getName(),
        readable: datapoint.isReadable(),
        writable: datapoint.isWritable(),
        valueType: datapoint.getValueType(),
        enum: datapoint.getEnum(),
        sfeType: datapoint.getSfeType(),
      }),
    );

    expect(findDeviceById.findById).toHaveBeenCalledWith({ id: '123' });
    expect(findDeviceById.findById).toHaveBeenCalledTimes(1);
    expect(findDeviceByPlantId.findByPlantId).toHaveBeenCalledTimes(0);

    expect(deviceDto.id).toEqual(returnedDevice.getId());
    expect(deviceDto.name).toEqual(returnedDevice.getName());
    expect(deviceDto.plantId).toEqual(returnedDevice.getPlantId());
    expect(deviceDto.type).toEqual(returnedDevice.getType());
    expect(deviceDto.subType).toEqual(returnedDevice.getSubType());

    expect(datapointsDto).toEqual(expectedDatapointsDto);
    expect(datapointsDto).toHaveLength(returnedDatapoints.length);
  });

  it("should return all plant's devices when requested by plant id, correctly converted into a dto", async () => {
    const returnedDatapointsA: Datapoint[] = [
      new Datapoint(
        '456',
        'brightness',
        true,
        true,
        'number',
        ['0', '100'],
        'slider',
      ),
      new Datapoint(
        '457',
        'power',
        true,
        true,
        'boolean',
        ['on', 'off'],
        'switch',
      ),
    ];
    const returnedDatapointsB: Datapoint[] = [
      new Datapoint(
        '458',
        'temperature',
        true,
        false,
        'number',
        ['16', '30'],
        'sensor',
      ),
    ];
    const returnedDatapointsC: Datapoint[] = [
      new Datapoint(
        '459',
        'mode',
        true,
        true,
        'string',
        ['cool', 'heat', 'dry'],
        'select',
      ),
      new Datapoint(
        '460',
        'fanSpeed',
        true,
        true,
        'string',
        ['low', 'mid', 'high'],
        'select',
      ),
      new Datapoint(
        '461',
        'lock',
        true,
        true,
        'boolean',
        ['locked', 'unlocked'],
        'toggle',
      ),
    ];

    const returnedDevices: Device[] = [
      new Device(
        '123',
        'plant-01',
        'living-room-light',
        'light',
        'dimmer',
        returnedDatapointsA,
      ),
      new Device(
        '124',
        'plant-01',
        'bedroom-thermostat',
        'climate',
        'thermostat',
        returnedDatapointsB,
      ),
      new Device(
        '125',
        'plant-01',
        'kitchen-ac',
        'climate',
        'air-conditioner',
        returnedDatapointsC,
      ),
    ];

    findDeviceByPlantId.findByPlantId.mockResolvedValue(returnedDevices);

    const devicesDto: DeviceDto[] = await controller.findByPlantId('plant-01');
    const expectedDevicesDto: DeviceDto[] = returnedDevices.map((device) => ({
      id: device.getId(),
      name: device.getName(),
      plantId: device.getPlantId(),
      type: device.getType(),
      subType: device.getSubType(),
      datapoints: device.getDatapoints().map((datapoint) => ({
        id: datapoint.getId(),
        name: datapoint.getName(),
        readable: datapoint.isReadable(),
        writable: datapoint.isWritable(),
        valueType: datapoint.getValueType(),
        enum: datapoint.getEnum(),
        sfeType: datapoint.getSfeType(),
      })),
    }));

    expect(findDeviceByPlantId.findByPlantId).toHaveBeenCalledWith({
      id: 'plant-01',
    });
    expect(findDeviceByPlantId.findByPlantId).toHaveBeenCalledTimes(1);
    expect(findDeviceById.findById).toHaveBeenCalledTimes(0);
    expect(devicesDto).toEqual(expectedDevicesDto);
    expect(devicesDto).toHaveLength(returnedDevices.length);
  });

  it('should throw an InternalServerErrorException when catch an error', async () => {
    findDeviceById.findById.mockRejectedValue(new Error('Error'));

    await expect(() => controller.findById('someId')).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should throw an InternalServerErrorException when catch an error', async () => {
    findDeviceByPlantId.findByPlantId.mockRejectedValue(new Error('Error'));

    await expect(() => controller.findByPlantId('plant-id')).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
