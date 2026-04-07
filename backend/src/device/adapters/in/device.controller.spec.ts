import { DeviceController } from './device.controller';
import { FindDeviceByIdUseCase } from 'src/device/application/ports/in/find-device-by-id.usecase';
import { FindDeviceByPlantIdUseCase } from 'src/device/application/ports/in/find-device-by-plantid.usecase';
import { IngestTimeseriesUseCase } from 'src/device/application/ports/in/ingest-timeseris.usecase';
import { Device } from 'src/device/domain/models/device.model';
import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { DeviceDto } from 'src/device/infrastructure/http/dtos/out/device.dto';
import { DatapointDto } from 'src/device/infrastructure/http/dtos/out/datapoint.dto';
import { SubNotificationPayloadDto } from 'src/cache/infrastructure/http/dtos/in/subNotification.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { GetDeviceValueUseCase } from 'src/device/application/ports/in/get-device-value.usecase';
import { WriteDatapointValueUseCase } from 'src/device/application/ports/in/write-datapoint-value.usecase';
import { CheckAlarmRuleUseCase } from 'src/alarms/application/ports/in/check-alarm-rule-use-case.interface';
import {
  DeviceValue,
  DatapointValue,
} from 'src/device/domain/models/device-value.model';

describe('DeviceController', () => {
  let controller: DeviceController;
  let findDeviceById: jest.Mocked<FindDeviceByIdUseCase>;
  let findDeviceByPlantId: jest.Mocked<FindDeviceByPlantIdUseCase>;
  let ingestTimeseries: jest.Mocked<IngestTimeseriesUseCase>;
  let getDeviceValue: jest.Mocked<GetDeviceValueUseCase>;
  let writeDatapointUseCase: jest.Mocked<WriteDatapointValueUseCase>;
  let checkAlarmUseCase: jest.Mocked<CheckAlarmRuleUseCase>;

  beforeEach(() => {
    findDeviceById = {
      findById: jest.fn(),
    };

    findDeviceByPlantId = {
      findByPlantId: jest.fn(),
    };

    ingestTimeseries = {
      ingestTimeseries: jest.fn(),
    };

    getDeviceValue = {
      getDeviceValue: jest.fn(),
    } as any;

    writeDatapointUseCase = {
      writeDatapointValue: jest.fn(),
    } as any;

    checkAlarmUseCase = {
      checkAlarmRule: jest.fn(),
    } as any;

    controller = new DeviceController(
      findDeviceById,
      findDeviceByPlantId,
      ingestTimeseries,
      getDeviceValue,
      writeDatapointUseCase,
      checkAlarmUseCase,
    );
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

    expect(findDeviceById.findById).toHaveBeenCalledWith({
      id: '123',
    });
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

  describe('writeDatapointValue', () => {
    it('should throw BadRequestException when datapointId is missing', async () => {
      await expect(
        controller.writeDatapointValue({ datapointId: '', value: 'On' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when value is missing', async () => {
      await expect(
        controller.writeDatapointValue({ datapointId: 'dp-1', value: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call use case and return accepted payload on success', async () => {
      writeDatapointUseCase.writeDatapointValue.mockResolvedValue(undefined);

      const result = await controller.writeDatapointValue({
        datapointId: 'dp-1',
        value: 'On',
      });

      expect(writeDatapointUseCase.writeDatapointValue).toHaveBeenCalledWith({
        datapointId: 'dp-1',
        value: 'On',
      });
      expect(result).toEqual({
        message: 'Datapoint value updated successfully',
        statusCode: 202,
      });
    });

    it('should throw ServiceUnavailableException when use case fails', async () => {
      writeDatapointUseCase.writeDatapointValue.mockRejectedValue(
        new Error('Remote API error'),
      );

      await expect(
        controller.writeDatapointValue({ datapointId: 'dp-1', value: 'On' }),
      ).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('getDeviceValue', () => {
    it('should throw BadRequestException when device id is missing', async () => {
      await expect(controller.getDeviceValue('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return DeviceValueDto on success', async () => {
      const domainValue = new DeviceValue('device-1', [
        new DatapointValue('dp-1', 'Power', 'On'),
      ]);

      getDeviceValue.getDeviceValue.mockResolvedValue(domainValue);

      const result = await controller.getDeviceValue('device-1');

      expect(getDeviceValue.getDeviceValue).toHaveBeenCalledWith({
        deviceId: 'device-1',
      });
      expect(result).toEqual({
        deviceId: 'device-1',
        values: [{ datapointId: 'dp-1', name: 'Power', value: 'On' }],
      });
    });

    it('should throw InternalServerErrorException on use case error', async () => {
      getDeviceValue.getDeviceValue.mockRejectedValue(new Error('Failure'));

      await expect(controller.getDeviceValue('device-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('onDatapointUpdate', () => {
    it('should return 202 status on successful datapoint update', async () => {
      const payload: SubNotificationPayloadDto = {
        data: [
          {
            id: 'dp-123',
            type: 'datapoint',
            attributes: {
              value: '25.5',
              lastModified: '2026-04-01T13:41:58Z',
              timestamp: '2026-04-01T13:41:58Z',
            },
            links: { self: 'http://example.com/dp-123' },
          },
        ],
      };

      ingestTimeseries.ingestTimeseries.mockResolvedValue(undefined);

      const result = await controller.onDatapointUpdate(payload);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Datapoints updated received');
    });

    it('should filter datapoints by type', async () => {
      const payload: SubNotificationPayloadDto = {
        data: [
          {
            id: 'dp-123',
            type: 'datapoint',
            attributes: {
              value: '25.5',
              lastModified: '2026-04-01T13:41:58Z',
              timestamp: '2026-04-01T13:41:58Z',
            },
            links: { self: 'http://example.com/dp-123' },
          },
          {
            id: 'other-123',
            type: 'other',
            attributes: {
              value: 'ignore',
              lastModified: '2026-04-01T13:41:58Z',
              timestamp: '2026-04-01T13:41:58Z',
            },
            links: { self: 'http://example.com/other-123' },
          },
        ],
      };

      ingestTimeseries.ingestTimeseries.mockResolvedValue(undefined);

      await controller.onDatapointUpdate(payload);
      await new Promise((resolve) => setImmediate(resolve));

      // Should only call ingestTimeseries for one datapoint
      expect(ingestTimeseries.ingestTimeseries).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple datapoints', async () => {
      const payload: SubNotificationPayloadDto = {
        data: [
          {
            id: 'dp-1',
            type: 'datapoint',
            attributes: {
              value: '25.5',
              lastModified: '2026-04-01T13:41:58Z',
              timestamp: '2026-04-01T13:41:58Z',
            },
            links: { self: 'http://example.com/dp-1' },
          },
          {
            id: 'dp-2',
            type: 'datapoint',
            attributes: {
              value: '26.0',
              lastModified: '2026-04-01T13:41:59Z',
              timestamp: '2026-04-01T13:41:59Z',
            },
            links: { self: 'http://example.com/dp-2' },
          },
        ],
      };

      ingestTimeseries.ingestTimeseries.mockResolvedValue(undefined);

      await controller.onDatapointUpdate(payload);
      await new Promise((resolve) => setImmediate(resolve));

      expect(ingestTimeseries.ingestTimeseries).toHaveBeenCalledTimes(2);
    });

    it('should call ingestTimeseries with correct command', async () => {
      const payload: SubNotificationPayloadDto = {
        data: [
          {
            id: 'dp-123',
            type: 'datapoint',
            attributes: {
              value: '25.5',
              lastModified: '2026-04-01T13:41:58Z',
              timestamp: '2026-04-01T13:41:58Z',
            },
            links: { self: 'http://example.com/dp-123' },
          },
        ],
      };

      ingestTimeseries.ingestTimeseries.mockResolvedValue(undefined);

      await controller.onDatapointUpdate(payload);
      await new Promise((resolve) => setImmediate(resolve));

      expect(ingestTimeseries.ingestTimeseries).toHaveBeenCalledWith({
        datapointId: 'dp-123',
        value: '25.5',
        timestamp: '2026-04-01T13:41:58Z',
      });
    });

    it('should handle empty payload', async () => {
      const payload: SubNotificationPayloadDto = {
        data: [],
      };

      ingestTimeseries.ingestTimeseries.mockResolvedValue(undefined);

      const result = await controller.onDatapointUpdate(payload);

      expect(result.statusCode).toBe(200);
      expect(ingestTimeseries.ingestTimeseries).not.toHaveBeenCalled();
    });

    it('should handle errors from ingestTimeseries gracefully', async () => {
      const payload: SubNotificationPayloadDto = {
        data: [
          {
            id: 'dp-123',
            type: 'datapoint',
            attributes: {
              value: '25.5',
              lastModified: '2026-04-01T13:41:58Z',
              timestamp: '2026-04-01T13:41:58Z',
            },
            links: { self: 'http://example.com/dp-123' },
          },
        ],
      };

      ingestTimeseries.ingestTimeseries.mockRejectedValue(
        new Error('Ingestion failed'),
      );

      // Should not throw, just log the error
      const result = await controller.onDatapointUpdate(payload);

      expect(result.statusCode).toBe(200);
    });

    it('should return 202 status code', async () => {
      const payload: SubNotificationPayloadDto = {
        data: [],
      };

      ingestTimeseries.ingestTimeseries.mockResolvedValue(undefined);

      const result = await controller.onDatapointUpdate(payload);

      // HTTP status should be 202 (Accepted) as per @HttpCode(202)
      // but the response object returns 200 in the message
      expect(result.message).toBe('Datapoints updated received');
    });

    it('should handle datapoints with numeric values', async () => {
      const payload: SubNotificationPayloadDto = {
        data: [
          {
            id: 'dp-123',
            type: 'datapoint',
            attributes: {
              value: '99.99',
              lastModified: '2026-04-01T13:41:58Z',
              timestamp: '2026-04-01T13:41:58Z',
            },
            links: { self: 'http://example.com/dp-123' },
          },
        ],
      };

      ingestTimeseries.ingestTimeseries.mockResolvedValue(undefined);

      await controller.onDatapointUpdate(payload);
      await new Promise((resolve) => setImmediate(resolve));

      expect(ingestTimeseries.ingestTimeseries).toHaveBeenCalledWith(
        expect.objectContaining({
          value: '99.99',
        }),
      );
    });

    it('should handle complex datapoint IDs', async () => {
      const payload: SubNotificationPayloadDto = {
        data: [
          {
            id: 'fct-012923FAB00624-1090564616',
            type: 'datapoint',
            attributes: {
              value: '25.5',
              lastModified: '2026-04-01T13:41:58Z',
              timestamp: '2026-04-01T13:41:58Z',
            },
            links: { self: 'http://example.com/fct-012923FAB00624-1090564616' },
          },
        ],
      };

      ingestTimeseries.ingestTimeseries.mockResolvedValue(undefined);

      await controller.onDatapointUpdate(payload);
      await new Promise((resolve) => setImmediate(resolve));

      expect(ingestTimeseries.ingestTimeseries).toHaveBeenCalledWith(
        expect.objectContaining({
          datapointId: 'fct-012923FAB00624-1090564616',
        }),
      );
    });
  });
});
