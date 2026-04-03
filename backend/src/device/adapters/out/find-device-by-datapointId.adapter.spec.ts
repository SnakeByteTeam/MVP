import { FindDeviceByDatapointIdAdapter } from './find-device-by-datapointId.adapter';
import { FindDeviceByDatapointIdRepoPort } from 'src/device/application/repository/find-device-by-datapointId.repository';
import { DeviceEntity } from 'src/device/infrastructure/persistence/entities/device.entity';
import { DatapointEntity } from 'src/device/infrastructure/persistence/entities/datapoint.entity';

describe('FindDeviceByDatapointIdAdapter', () => {
  let adapter: FindDeviceByDatapointIdAdapter;
  let repo: jest.Mocked<FindDeviceByDatapointIdRepoPort>;

  beforeEach(() => {
    repo = {
      findByDatapointId: jest.fn(),
    };

    adapter = new FindDeviceByDatapointIdAdapter(repo);
  });

  it('should throw when datapointId is missing', async () => {
    await expect(
      adapter.findByDatapointId({ datapointId: '' }),
    ).rejects.toThrow('[FIND BY DATAPOINTID ADAPTER] There is no datapointId');
  });

  it('should throw when repository returns null', async () => {
    repo.findByDatapointId.mockResolvedValue(null);

    await expect(
      adapter.findByDatapointId({ datapointId: 'dp-1' }),
    ).rejects.toThrow("Can't find device with datapoint dp-1");
  });

  it('should map entity to domain when repository returns device', async () => {
    const datapointEntity = new DatapointEntity();
    datapointEntity.id = 'dp-1';
    datapointEntity.name = 'Power';
    datapointEntity.readable = true;
    datapointEntity.writable = true;
    datapointEntity.valueType = 'string';
    datapointEntity.enum = ['Off', 'On'];
    datapointEntity.sfeType = 'SFE_Cmd_OnOff';

    const entity = new DeviceEntity();
    entity.id = 'device-1';
    entity.plantId = 'plant-1';
    entity.name = 'Kitchen Light';
    entity.type = 'light';
    entity.subType = 'switch';
    entity.datapoints = [datapointEntity];

    repo.findByDatapointId.mockResolvedValue(entity);

    const result = await adapter.findByDatapointId({ datapointId: 'dp-1' });

    expect(repo.findByDatapointId).toHaveBeenCalledWith('dp-1');
    expect(result.getId()).toBe('device-1');
    expect(result.getPlantId()).toBe('plant-1');
    expect(result.getDatapoints()).toHaveLength(1);
  });

  it('should propagate repository errors', async () => {
    repo.findByDatapointId.mockRejectedValue(new Error('database failure'));

    await expect(
      adapter.findByDatapointId({ datapointId: 'dp-1' }),
    ).rejects.toThrow('database failure');
  });
});
