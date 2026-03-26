import { FindPlantByIdAdapter } from './find-plant-by-id.adapter';
import { UpdateCacheUseCase } from 'src/cache/application/ports/in/get-valid-cache.usecase';
import { Plant } from 'src/plant/domain/models/plant.model';
import { Room } from 'src/plant/domain/models/room.model';

describe('FindPlantByIdAdapter', () => {
  let adapter: FindPlantByIdAdapter;
  let cachePort: jest.Mocked<UpdateCacheUseCase>;

  beforeEach(() => {
    cachePort = {
      updateCache: jest.fn(),
    };

    adapter = new FindPlantByIdAdapter(cachePort);
  });

  it('should throw PlantId is null when cmd.id is absent', async () => {
    await expect(adapter.findById({ id: '' })).rejects.toThrow(
      Error('PlantId is null'),
    );
  });

  it('should return null when plant not found in cache', async () => {
    cachePort.updateCache.mockResolvedValue(null as any);

    const result = await adapter.findById({ id: 'plant-1' });

    expect(result).toBeNull();
    expect(cachePort.updateCache).toHaveBeenCalledWith({
      plantId: 'plant-1',
    });
  });

  it('should return plant when found in cache', async () => {
    const room = new Room('room-1', 'Living Room', []);
    const plant = new Plant('plant-1', 'My Plant', [room]);

    cachePort.updateCache.mockResolvedValue(plant);

    const result = await adapter.findById({ id: 'plant-1' });

    expect(result).toBe(plant);
    expect(cachePort.updateCache).toHaveBeenCalledWith({
      plantId: 'plant-1',
    });
  });
});
