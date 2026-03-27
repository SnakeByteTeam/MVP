import { FindDeviceByIdAdapter } from './find-device-by-id.adapter';
import { FindDeviceByIdRepoPort } from 'src/device/application/repository/find-device-by-id.repository';
import { DeviceEntity } from 'src/device/infrastructure/persistence/entities/device.entity';
import { DatapointEntity } from 'src/device/infrastructure/persistence/entities/datapoint.entity';
import { FindDeviceByIdCmd } from 'src/device/application/commands/find-device-by-id.command';

describe('FindDeviceByIdAdapter', () => {
  let adapter: FindDeviceByIdAdapter;
  let repo: jest.Mocked<FindDeviceByIdRepoPort>;

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
    };

    adapter = new FindDeviceByIdAdapter(repo);
  });

  it('should return mapped device when repository finds entity', async () => {
    const datapointEntity = new DatapointEntity();
    datapointEntity.id = 'dp-1';
    datapointEntity.name = 'brightness';
    datapointEntity.readable = true;
    datapointEntity.writable = true;
    datapointEntity.valueType = 'number';
    datapointEntity.enum = ['0', '100'];
    datapointEntity.sfeType = 'slider';

    const deviceEntity = new DeviceEntity();
    deviceEntity.id = 'device-123';
    deviceEntity.plantId = 'plant-01';
    deviceEntity.name = 'living-room-light';
    deviceEntity.type = 'light';
    deviceEntity.subType = 'dimmer';
    deviceEntity.datapoints = [datapointEntity];

    repo.findById.mockResolvedValue(deviceEntity);

    const cmd: FindDeviceByIdCmd = { id: 'device-123' };
    const result = await adapter.findById(cmd);

    expect(result.getId()).toBe('device-123');
    expect(result.getName()).toBe('living-room-light');
    expect(result.getType()).toBe('light');
    expect(result.getSubType()).toBe('dimmer');
    expect(result.getDatapoints()).toHaveLength(1);
    expect(repo.findById).toHaveBeenCalledWith('device-123');
    expect(repo.findById).toHaveBeenCalledTimes(1);
  });

  it('should throw error when device id is empty', async () => {
    const cmd: FindDeviceByIdCmd = { id: '' };

    await expect(adapter.findById(cmd)).rejects.toThrow(
      '[FindDeviceByIdAdapter] Id is empty',
    );
  });

  it('should throw error when repository returns null', async () => {
    repo.findById.mockResolvedValue(null);

    const cmd: FindDeviceByIdCmd = { id: 'non-existent' };

    await expect(adapter.findById(cmd)).rejects.toThrow(
      "[FindDeviceByIdAdapter] Can't find device on db",
    );
  });

  it('should propagate repository errors', async () => {
    const dbError = new Error('Database connection failed');
    repo.findById.mockRejectedValue(dbError);

    const cmd: FindDeviceByIdCmd = { id: 'device-123' };

    await expect(adapter.findById(cmd)).rejects.toThrow(dbError);
  });
});
