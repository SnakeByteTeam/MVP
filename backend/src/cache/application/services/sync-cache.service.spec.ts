import { Plant } from 'src/plant/domain/models/plant.model';
import { ReadCachePort } from '../ports/out/read-cache.port';
import { FetchNewCachePort } from '../ports/out/fetch-new-cache.port';
import { WriteCachePort } from '../ports/out/write-cache.port';
import { SyncCacheService } from './sync-cache.service';

describe('SyncCacheService', () => {
  let service: SyncCacheService;
  let fetchPort: jest.Mocked<FetchNewCachePort>;
  let writePort: jest.Mocked<WriteCachePort>;

  beforeEach(() => {
    fetchPort = {
      fetch: jest.fn(),
    };

    writePort = {
      writeStructure: jest.fn(),
    };

    service = new SyncCacheService(fetchPort, writePort);
  });

  it('should throw PlantId is null when cmd.plantId is absent', async () => {
    await expect(service.updateCache({ plantId: '' })).rejects.toThrow(
      Error('PlantId is null'),
    );
  });

  it('should fetch and write plant structure when cache is stale', async () => {
    const staleCachedAt = new Date(Date.now() - 13 * 60 * 60 * 1000); // 13 hours ago
    const stalePlant = new Plant('plant-1', 'Old Plant', [], staleCachedAt);
    const fetchedPlant = new Plant('plant-1', 'New Plant', []);

    readPort.readCache.mockResolvedValue(stalePlant);
    fetchPort.fetch.mockResolvedValue(fetchedPlant);
    writePort.writeStructure.mockResolvedValue(true);

    const result = await service.updateCache({ plantId: 'plant-1' });

    expect(result).toBe(fetchedPlant);
    expect(readPort.readCache).toHaveBeenCalledTimes(1);
    expect(fetchPort.fetch).toHaveBeenCalledWith({ plantId: 'plant-1' });
    expect(fetchPort.fetch).toHaveBeenCalledTimes(1);
    expect(writePort.writeStructure).toHaveBeenCalledWith(fetchedPlant);
    expect(writePort.writeStructure).toHaveBeenCalledTimes(1);
  });
});
