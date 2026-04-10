import { DeviceAdapter } from 'src/device/adapters/out/device.adapter';
import { DEVICE_REPOSITORY_PORT, DeviceRepositoryPort } from 'src/device/application/repository/device.repository';
import { GETVALIDTOKENPORT, GetValidTokenPort } from 'src/api-auth-vimar/application/ports/out/get-valid-token.port';
import { DeviceEntity } from 'src/device/infrastructure/persistence/entities/device.entity';
import { DatapointEntity } from 'src/device/infrastructure/persistence/entities/datapoint.entity';
import { DatapointExtractedDto } from 'src/device/infrastructure/http/dtos/in/datapoint-response.dto';
import { FindDeviceByIdCmd } from 'src/device/application/commands/find-device-by-id.command';
import { FindDeviceByPlantIdCmd } from 'src/device/application/commands/find-device-by-plantid.command';
import { FindDeviceByDatapointIdCmd } from 'src/device/application/commands/find-device-by-datapointId.command';
import { IngestTimeseriesCmd } from 'src/device/application/commands/ingest-timeseries.command';
import { GetDeviceValueCmd } from 'src/device/application/commands/get-device-value.command';
import { WriteDatapointValueCmd } from 'src/device/application/commands/write-datapoint-value.command';

describe('DeviceAdapter', () => {
  let adapter: DeviceAdapter;
  let repositoryPort: jest.Mocked<DeviceRepositoryPort>;
  let tokenPort: jest.Mocked<GetValidTokenPort>;

  const createDatapointEntity = (): DatapointEntity => {
    const datapoint = new DatapointEntity();
    datapoint.id = 'dp-1';
    datapoint.name = 'brightness';
    datapoint.readable = true;
    datapoint.writable = true;
    datapoint.valueType = 'number';
    datapoint.enum = ['0', '100'];
    datapoint.sfeType = 'slider';
    return datapoint;
  };

  const createDeviceEntity = (): DeviceEntity => {
    const device = new DeviceEntity();
    device.id = 'device-123';
    device.plantId = 'plant-01';
    device.name = 'living-room-light';
    device.type = 'light';
    device.subType = 'dimmer';
    device.datapoints = [createDatapointEntity()];
    return device;
  };

  beforeEach(() => {
    repositoryPort = {
      findById: jest.fn(),
      findByPlantId: jest.fn(),
      findByDatapointId: jest.fn(),
      ingestTimeseries: jest.fn(),
      getDeviceValue: jest.fn(),
      writeDeviceValue: jest.fn(),
    };

    tokenPort = {
      getValidToken: jest.fn(),
    };

    adapter = new DeviceAdapter(repositoryPort, tokenPort);
  });

  describe('findById', () => {
    it('should return mapped device when repository finds entity', async () => {
      const deviceEntity = createDeviceEntity();
      repositoryPort.findById.mockResolvedValue(deviceEntity);

      const cmd: FindDeviceByIdCmd = { id: 'device-123' };
      const result = await adapter.findById(cmd);

      expect(result.getId()).toBe('device-123');
      expect(result.getName()).toBe('living-room-light');
      expect(result.getType()).toBe('light');
      expect(result.getSubType()).toBe('dimmer');
      expect(result.getDatapoints()).toHaveLength(1);
      expect(repositoryPort.findById).toHaveBeenCalledWith('device-123');
      expect(repositoryPort.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw when id is missing', async () => {
      const cmd: FindDeviceByIdCmd = { id: '' };
      await expect(adapter.findById(cmd)).rejects.toThrow(
        '[DEVICE ADAPTER] id is required'
      );
    });

    it('should throw when repository returns null', async () => {
      repositoryPort.findById.mockResolvedValue(null);

      const cmd: FindDeviceByIdCmd = { id: 'device-123' };
      await expect(adapter.findById(cmd)).rejects.toThrow();
    });
  });

  describe('findByPlantId', () => {
    it('should return mapped devices when repository finds entities', async () => {
      const device1 = createDeviceEntity();
      device1.id = 'device-1';
      const device2 = createDeviceEntity();
      device2.id = 'device-2';

      repositoryPort.findByPlantId.mockResolvedValue([device1, device2]);

      const cmd: FindDeviceByPlantIdCmd = { id: 'plant-01' };
      const result = await adapter.findByPlantId(cmd);

      expect(result).toHaveLength(2);
      expect(result[0].getId()).toBe('device-1');
      expect(result[1].getId()).toBe('device-2');
      expect(repositoryPort.findByPlantId).toHaveBeenCalledWith('plant-01');
    });

    it('should throw when plantId is missing', async () => {
      const cmd: FindDeviceByPlantIdCmd = { id: '' };
      await expect(adapter.findByPlantId(cmd)).rejects.toThrow(
        '[DEVICE ADAPTER] plantId is required'
      );
    });

    it('should throw when repository returns null', async () => {
      repositoryPort.findByPlantId.mockResolvedValue(null);

      const cmd: FindDeviceByPlantIdCmd = { id: 'plant-01' };
      await expect(adapter.findByPlantId(cmd)).rejects.toThrow();
    });
  });

  describe('findByDatapointId', () => {
    it('should return mapped device when repository finds entity', async () => {
      const deviceEntity = createDeviceEntity();
      repositoryPort.findByDatapointId.mockResolvedValue(deviceEntity);

      const cmd: FindDeviceByDatapointIdCmd = { datapointId: 'dp-1' };
      const result = await adapter.findByDatapointId(cmd);

      expect(result.getId()).toBe('device-123');
      expect(repositoryPort.findByDatapointId).toHaveBeenCalledWith('dp-1');
    });

    it('should throw when datapointId is missing', async () => {
      const cmd: FindDeviceByDatapointIdCmd = { datapointId: '' };
      await expect(adapter.findByDatapointId(cmd)).rejects.toThrow(
        '[DEVICE ADAPTER] datapointId is required'
      );
    });

    it('should throw when repository returns null', async () => {
      repositoryPort.findByDatapointId.mockResolvedValue(null);

      const cmd: FindDeviceByDatapointIdCmd = { datapointId: 'dp-1' };
      await expect(adapter.findByDatapointId(cmd)).rejects.toThrow();
    });
  });

  describe('ingestTimeseries', () => {
    it('should validate and ingest timeseries data', async () => {
      repositoryPort.ingestTimeseries.mockResolvedValue(true);

      const cmd: IngestTimeseriesCmd = {
        datapointId: 'dp-1',
        value: '85',
        timestamp: '2024-01-01T10:00:00Z',
      };

      await adapter.ingestTimeseries(cmd);

      expect(repositoryPort.ingestTimeseries).toHaveBeenCalledWith(
        'dp-1',
        '85',
        '2024-01-01T10:00:00Z'
      );
    });

    it('should throw when required parameters are missing', async () => {
      const cmd: IngestTimeseriesCmd = {
        datapointId: '',
        value: '85',
        timestamp: '2024-01-01T10:00:00Z',
      };

      await expect(adapter.ingestTimeseries(cmd)).rejects.toThrow(
        '[DEVICE ADAPTER] datapointId, value, and timestamp are required'
      );
    });

    it('should throw when repository ingest fails', async () => {
      repositoryPort.ingestTimeseries.mockResolvedValue(false);

      const cmd: IngestTimeseriesCmd = {
        datapointId: 'dp-1',
        value: '85',
        timestamp: '2024-01-01T10:00:00Z',
      };

      await expect(adapter.ingestTimeseries(cmd)).rejects.toThrow(
        '[DEVICE ADAPTER] Failed to ingest timeseries'
      );
    });
  });

  describe('getDeviceValue', () => {
    it('should fetch device value with valid token', async () => {
      tokenPort.getValidToken.mockResolvedValue('token-123');
      repositoryPort.getDeviceValue.mockResolvedValue([
        new DatapointExtractedDto('dp-1', 'Power', 'On'),
        new DatapointExtractedDto('dp-2', 'Brightness', 85),
      ]);

      const cmd: GetDeviceValueCmd = {
        deviceId: 'device-123',
        plantId: 'plant-01',
      };
      const result = await adapter.getDeviceValue(cmd);

      expect(result.getDeviceId()).toBe('device-123');
      expect(result.getValues()).toHaveLength(2);
      expect(result.getValues()[0].getDatapointId()).toBe('dp-1');
      expect(result.getValues()[1].getValue()).toBe(85);
      expect(tokenPort.getValidToken).toHaveBeenCalled();
      expect(repositoryPort.getDeviceValue).toHaveBeenCalledWith(
        'token-123',
        'plant-01',
        'device-123'
      );
    });

    it('should throw when deviceId or plantId is missing', async () => {
      const cmd: GetDeviceValueCmd = {
        deviceId: '',
        plantId: 'plant-01',
      };

      await expect(adapter.getDeviceValue(cmd)).rejects.toThrow(
        '[DEVICE ADAPTER] deviceId and plantId are required'
      );
    });

    it('should throw when valid token is missing', async () => {
      tokenPort.getValidToken.mockResolvedValue(null);

      const cmd: GetDeviceValueCmd = {
        deviceId: 'device-123',
        plantId: 'plant-01',
      };

      await expect(adapter.getDeviceValue(cmd)).rejects.toThrow(
        '[DEVICE ADAPTER] Failed to get valid token'
      );
    });
  });

  describe('writeDatapointValue', () => {
    it('should write datapoint value with valid token', async () => {
      tokenPort.getValidToken.mockResolvedValue('token-123');
      repositoryPort.writeDeviceValue.mockResolvedValue(true);

      const cmd: WriteDatapointValueCmd = {
        datapointId: 'dp-1',
        plantId: 'plant-01',
        value: '85',
      };

      await adapter.writeDatapointValue(cmd);

      expect(tokenPort.getValidToken).toHaveBeenCalled();
      expect(repositoryPort.writeDeviceValue).toHaveBeenCalledWith(
        'token-123',
        'plant-01',
        'dp-1',
        '85'
      );
    });

    it('should throw when required parameters are missing', async () => {
      const cmd: WriteDatapointValueCmd = {
        datapointId: '',
        plantId: 'plant-01',
        value: '85',
      };

      await expect(adapter.writeDatapointValue(cmd)).rejects.toThrow(
        '[DEVICE ADAPTER] datapointId, plantId, and value are required'
      );
    });

    it('should throw when valid token is missing', async () => {
      tokenPort.getValidToken.mockResolvedValue(null);

      const cmd: WriteDatapointValueCmd = {
        datapointId: 'dp-1',
        plantId: 'plant-01',
        value: '85',
      };

      await expect(adapter.writeDatapointValue(cmd)).rejects.toThrow(
        '[DEVICE ADAPTER] Failed to get valid token'
      );
    });

    it('should throw when write fails', async () => {
      tokenPort.getValidToken.mockResolvedValue('token-123');
      repositoryPort.writeDeviceValue.mockResolvedValue(false);

      const cmd: WriteDatapointValueCmd = {
        datapointId: 'dp-1',
        plantId: 'plant-01',
        value: '85',
      };

      await expect(adapter.writeDatapointValue(cmd)).rejects.toThrow(
        '[DEVICE ADAPTER] Failed to write datapoint value'
      );
    });
  });
});
