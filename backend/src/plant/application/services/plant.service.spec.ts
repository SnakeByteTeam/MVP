import { Plant } from 'src/plant/domain/models/plant.model';
import { SyncPlantStructureUseCase } from '../ports/in/sync-plant-structure.usecase';
import { FindPlantByIdPort } from '../ports/out/find-plant-by-id.port';
import { PlantService } from './plant.service';

describe('PlantService', () => {
  let service: PlantService;
  let syncUseCase: jest.Mocked<SyncPlantStructureUseCase>;
  let findByIdPort: jest.Mocked<FindPlantByIdPort>;

  beforeEach(() => {
    syncUseCase = {
      sync: jest.fn(),
    };

    findByIdPort = {
      findById: jest.fn(),
    };

    service = new PlantService(syncUseCase, findByIdPort);
  });

  it('should return cached plant when cache is fresh (<= 12h)', async () => {
    const freshCachedAt = new Date(Date.now() - 60 * 60 * 1000);
    const plant = new Plant('plant-1', 'My Plant', [], freshCachedAt);

    findByIdPort.findById.mockResolvedValue(plant);

    const result = await service.findById({ id: 'plant-1' });

    expect(result).toBe(plant);
    expect(findByIdPort.findById).toHaveBeenCalledTimes(1);
    expect(syncUseCase.sync).toHaveBeenCalledTimes(0);
  });

  it('should sync and return refreshed plant when cache is stale (> 12h) and sync succeeds', async () => {
    const stalePlant = new Plant('plant-1', 'Old Plant', [], new Date(Date.now() - 13 * 60 * 60 * 1000));
    const refreshedPlant = new Plant('plant-1', 'New Plant', [], new Date());

    findByIdPort.findById
      .mockResolvedValueOnce(stalePlant)
      .mockResolvedValueOnce(refreshedPlant);
    syncUseCase.sync.mockResolvedValue(true);

    const result = await service.findById({ id: 'plant-1' });

    expect(syncUseCase.sync).toHaveBeenCalledWith({ id: 'plant-1' });
    expect(syncUseCase.sync).toHaveBeenCalledTimes(1);
    expect(findByIdPort.findById).toHaveBeenCalledTimes(2);
    expect(result).toBe(refreshedPlant);
  });

  it('should return stale cached plant when sync fails', async () => {
    const stalePlant = new Plant('plant-1', 'Old Plant', [], new Date(Date.now() - 13 * 60 * 60 * 1000));

    findByIdPort.findById.mockResolvedValue(stalePlant);
    syncUseCase.sync.mockResolvedValue(false);

    const result = await service.findById({ id: 'plant-1' });

    expect(syncUseCase.sync).toHaveBeenCalledWith({ id: 'plant-1' });
    expect(findByIdPort.findById).toHaveBeenCalledTimes(1);
    expect(result).toBe(stalePlant);
  });

  it('should throw original error when find fails and sync fails', async () => {
    const expectedError = new Error('DB down');
    findByIdPort.findById.mockRejectedValue(expectedError);
    syncUseCase.sync.mockResolvedValue(false);

    await expect(service.findById({ id: 'plant-1' })).rejects.toThrow(expectedError);

    expect(syncUseCase.sync).toHaveBeenCalledWith({ id: 'plant-1' });
    expect(syncUseCase.sync).toHaveBeenCalledTimes(1);
  });

  it('should return plant after successful sync when first read fails', async () => {
    const recoveredPlant = new Plant('plant-1', 'Recovered Plant', []);

    findByIdPort.findById
      .mockRejectedValueOnce(new Error('cache read failed'))
      .mockResolvedValueOnce(recoveredPlant);
    syncUseCase.sync.mockResolvedValue(true);

    const result = await service.findById({ id: 'plant-1' });

    expect(syncUseCase.sync).toHaveBeenCalledWith({ id: 'plant-1' });
    expect(findByIdPort.findById).toHaveBeenCalledTimes(2);
    expect(result).toBe(recoveredPlant);
  });
});
