import { FindDeviceByIdAdapter } from './find-device-by-id.adapter';
import { GetValidCachePort } from 'src/cache/application/ports/out/get-valid-cache.port';
import { Device } from 'src/device/domain/models/device.model';
import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { Plant } from 'src/plant/domain/models/plant.model';
import { Room } from 'src/plant/domain/models/room.model';
import { FindDeviceByIdCmd } from 'src/device/application/commands/find-device-by-id.command';

describe('FindDeviceByIdAdapter', () => {
  let adapter: FindDeviceByIdAdapter;
  let cachePort: jest.Mocked<GetValidCachePort>;

  beforeEach(() => {
    cachePort = {
      getValidCache: jest.fn(),
    };

    adapter = new FindDeviceByIdAdapter(cachePort);
  });

  it('should return a device when found', async () => {
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
    const device = new Device(
      '123',
      'plant-01',
      'living-room-light',
      'light',
      'dimmer',
      datapoints,
    );
    const room = new Room('room-1', 'Living Room', [device]);
    const plant = new Plant('plant-01', 'My Plant', [room]);

    cachePort.getValidCache.mockResolvedValue(plant);

    const cmd: FindDeviceByIdCmd = { id: '123', plantId: 'plant-01' };
    const result = await adapter.findById(cmd);

    expect(result).toBe(device);
    expect(cachePort.getValidCache).toHaveBeenCalledWith({
      plantId: 'plant-01',
    });
    expect(cachePort.getValidCache).toHaveBeenCalledTimes(1);
  });

  it('should throw error when device id is null', async () => {
    const plant = new Plant('plant-01', 'My Plant', []);

    cachePort.getValidCache.mockResolvedValue(plant);

    const cmd: FindDeviceByIdCmd = { id: '', plantId: 'plant-01' };

    await expect(adapter.findById(cmd)).rejects.toThrow(
      Error('DeviceId is null'),
    );
  });

  it('should throw error when device is not found', async () => {
    const room = new Room('room-1', 'Living Room', []);
    const plant = new Plant('plant-01', 'My Plant', [room]);

    cachePort.getValidCache.mockResolvedValue(plant);

    const cmd: FindDeviceByIdCmd = { id: 'non-existent', plantId: 'plant-01' };

    await expect(adapter.findById(cmd)).rejects.toThrow(
      Error('Device non-existent not found'),
    );
  });

  it('should throw error when plant id is null', async () => {
    const cmd: FindDeviceByIdCmd = { id: '123', plantId: '' };

    await expect(adapter.findById(cmd)).rejects.toThrow(
      Error('PlantId is null'),
    );
  });

  it('should throw error when plant is not found', async () => {
    cachePort.getValidCache.mockResolvedValue(null as any);

    const cmd: FindDeviceByIdCmd = { id: '123', plantId: 'non-existent-plant' };

    await expect(adapter.findById(cmd)).rejects.toThrow(
      Error('Plant non-existent-plant not found'),
    );
  });
});
