import { FindDeviceByPlantIdAdapter } from './find-device-by-plantId.adapter';
import { FindDeviceByPlantIdCmd } from 'src/device/application/commands/find-device-by-plantid.command';
import { FindDeviceByPlantIdRepoPort } from 'src/device/application/repository/find-device-by-plant-id.repository';
import { DeviceEntity } from 'src/device/infrastructure/persistence/entities/device.entity';
import { DatapointEntity } from 'src/device/infrastructure/persistence/entities/datapoint.entity';

describe('FindDeviceByPlantIdAdapter', () => {
  let adapter: FindDeviceByPlantIdAdapter;
  let repo: jest.Mocked<FindDeviceByPlantIdRepoPort>;

  beforeEach(() => {
    repo = {
      findByPlantId: jest.fn(),
    };

    adapter = new FindDeviceByPlantIdAdapter(repo);
  });

  it('should return mapped device array when repository finds devices', async () => {
    const datapointEntity1 = new DatapointEntity();
    datapointEntity1.id = 'dp-1';
    datapointEntity1.name = 'brightness';
    datapointEntity1.readable = true;
    datapointEntity1.writable = true;
    datapointEntity1.valueType = 'number';
    datapointEntity1.enum = ['0', '100'];
    datapointEntity1.sfeType = 'slider';

    const deviceEntity1 = new DeviceEntity();
    deviceEntity1.id = 'device-123';
    deviceEntity1.plantId = 'plant-01';
    deviceEntity1.name = 'living-room-light';
    deviceEntity1.type = 'light';
    deviceEntity1.subType = 'dimmer';
    deviceEntity1.datapoints = [datapointEntity1];

    const deviceEntity2 = new DeviceEntity();
    deviceEntity2.id = 'device-124';
    deviceEntity2.plantId = 'plant-01';
    deviceEntity2.name = 'kitchen-light';
    deviceEntity2.type = 'light';
    deviceEntity2.subType = 'switch';
    deviceEntity2.datapoints = [];

    repo.findByPlantId.mockResolvedValue([deviceEntity1, deviceEntity2]);

    const cmd: FindDeviceByPlantIdCmd = { id: 'plant-01' };
    const result = await adapter.findByPlantId(cmd);

    expect(result).toHaveLength(2);
    expect(result[0].getId()).toBe('device-123');
    expect(result[0].getName()).toBe('living-room-light');
    expect(result[0].getType()).toBe('light');
    expect(result[0].getSubType()).toBe('dimmer');
    expect(result[0].getDatapoints()).toHaveLength(1);

    expect(result[1].getId()).toBe('device-124');
    expect(result[1].getName()).toBe('kitchen-light');
    expect(repo.findByPlantId).toHaveBeenCalledWith('plant-01');
    expect(repo.findByPlantId).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when repository returns empty array', async () => {
    repo.findByPlantId.mockResolvedValue([]);

    const cmd: FindDeviceByPlantIdCmd = { id: 'plant-01' };
    const result = await adapter.findByPlantId(cmd);

    expect(result).toHaveLength(0);
    expect(repo.findByPlantId).toHaveBeenCalledWith('plant-01');
    expect(repo.findByPlantId).toHaveBeenCalledTimes(1);
  });

  it('should throw error when command id is empty', async () => {
    const cmd: FindDeviceByPlantIdCmd = { id: '' };

    await expect(adapter.findByPlantId(cmd)).rejects.toThrow(
      '[FindDeviceByPlantIdAdapter] PlantId is empty',
    );
  });

  it('should throw error when command id is null', async () => {
    const cmd = { id: null } as any;

    await expect(adapter.findByPlantId(cmd)).rejects.toThrow(
      '[FindDeviceByPlantIdAdapter] PlantId is empty',
    );
  });

  it('should throw error when repository returns null', async () => {
    repo.findByPlantId.mockResolvedValue(null);

    const cmd: FindDeviceByPlantIdCmd = { id: 'non-existent-plant' };

    await expect(adapter.findByPlantId(cmd)).rejects.toThrow(
      "[FindDeviceByPlantIdAdapter] Can't find the devices of plant non-existent-plant",
    );
  });

  it('should propagate repository errors', async () => {
    const dbError = new Error('Database connection failed');
    repo.findByPlantId.mockRejectedValue(dbError);

    const cmd: FindDeviceByPlantIdCmd = { id: 'plant-01' };

    await expect(() => adapter.findByPlantId(cmd)).rejects.toThrow(dbError);
  });
});
