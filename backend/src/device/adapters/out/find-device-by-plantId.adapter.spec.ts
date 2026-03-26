import { FindDeviceByPlantIdAdapter } from './find-device-by-plantId.adapter';
import { UpdateCacheUseCase } from 'src/cache/application/ports/in/get-valid-cache.usecase';
import { Device } from 'src/device/domain/models/device.model';
import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { Plant } from 'src/plant/domain/models/plant.model';
import { Room } from 'src/plant/domain/models/room.model';
import { FindDeviceByPlantIdCmd } from 'src/device/application/commands/find-device-by-plantid.command';

describe('FindDeviceByPlantIdAdapter', () => {
  let adapter: FindDeviceByPlantIdAdapter;
  let cachePort: jest.Mocked<UpdateCacheUseCase>;

  beforeEach(() => {
    cachePort = {
      updateCache: jest.fn(),
    };

    adapter = new FindDeviceByPlantIdAdapter(cachePort);
  });

  it('should return device array when devices are found', async () => {
    const datapoints = [
      new Datapoint(
        'dp-1',
        'brightness',
        true,
        true,
        'number',
        ['0', '100'],
        'slider',
      ),
    ];
    const device1 = new Device(
      '123',
      'plant-01',
      'living-room-light',
      'light',
      'dimmer',
      datapoints,
    );
    const device2 = new Device(
      '124',
      'plant-01',
      'kitchen-light',
      'light',
      'switch',
      datapoints,
    );
    const room = new Room('room-1', 'Living Room', [device1, device2]);
    const plant = new Plant('plant-01', 'My Plant', [room]);

    cachePort.updateCache.mockResolvedValue(plant);

    const cmd: FindDeviceByPlantIdCmd = { id: 'plant-01' };
    const result = await adapter.findByPlantId(cmd);

    expect(result).toHaveLength(2);
    expect(result).toContain(device1);
    expect(result).toContain(device2);
    expect(cachePort.updateCache).toHaveBeenCalledWith({
      plantId: 'plant-01',
    });
    expect(cachePort.updateCache).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no devices found', async () => {
    const room = new Room('room-1', 'Living Room', []);
    const plant = new Plant('plant-01', 'My Plant', [room]);

    cachePort.updateCache.mockResolvedValue(plant);

    const cmd: FindDeviceByPlantIdCmd = { id: 'plant-01' };
    const result = await adapter.findByPlantId(cmd);

    expect(result).toHaveLength(0);
    expect(cachePort.updateCache).toHaveBeenCalledTimes(1);
  });

  it('should throw error when plant id is null', async () => {
    const cmd: FindDeviceByPlantIdCmd = { id: '' };

    await expect(adapter.findByPlantId(cmd)).rejects.toThrow(
      Error('PlantId is null'),
    );
  });

  it('should throw error when plant is not found', async () => {
    cachePort.updateCache.mockResolvedValue(null as any);

    const cmd: FindDeviceByPlantIdCmd = { id: 'non-existent-plant' };

    await expect(adapter.findByPlantId(cmd)).rejects.toThrow(
      Error('Plant non-existent-plant not found'),
    );
  });
});
