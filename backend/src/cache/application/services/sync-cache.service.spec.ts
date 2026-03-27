import { Plant } from 'src/plant/domain/models/plant.model';
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

  it('should fetch and write plant structure when updateCache is called', async () => {
    const fetchedPlant = new Plant('plant-1', 'New Plant', [], 1);

    fetchPort.fetch.mockResolvedValue(fetchedPlant);
    writePort.writeStructure.mockResolvedValue(true);

    const result = await service.updateCache({ plantId: 'plant-1' });

    expect(result).toBe(true);
    expect(fetchPort.fetch).toHaveBeenCalledWith({ plantId: 'plant-1' });
    expect(fetchPort.fetch).toHaveBeenCalledTimes(1);
    expect(writePort.writeStructure).toHaveBeenCalledWith(fetchedPlant);
    expect(writePort.writeStructure).toHaveBeenCalledTimes(1);
  });

  it('should throw error when write cache fails', async () => {
    const fetchedPlant = new Plant('plant-1', 'New Plant', [], 1);
    fetchPort.fetch.mockResolvedValue(fetchedPlant);
    writePort.writeStructure.mockResolvedValue(false);

    await expect(service.updateCache({ plantId: 'plant-1' })).rejects.toThrow(
      Error('Failed to write cache'),
    );
  });

  it('should propagate fetch errors', async () => {
    const fetchError = new Error('API call failed');
    fetchPort.fetch.mockRejectedValue(fetchError);

    await expect(service.updateCache({ plantId: 'plant-1' })).rejects.toThrow(
      fetchError,
    );
  });
});
