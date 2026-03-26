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

  it('should throw PlantId is null when cmd.id is absent', async () => {
    await expect(service.sync({ id: '' })).rejects.toThrow(
      Error('PlantId is null'),
    );
  });

  it('should fetch and write plant structure when cmd is valid', async () => {
    const fetchedPlant = new Plant('plant-1', 'My Plant', []);

    fetchPort.fetch.mockResolvedValue(fetchedPlant);
    writePort.writeStructure.mockResolvedValue(true);

    const result = await service.sync({ id: 'plant-1' });

    expect(fetchPort.fetch).toHaveBeenCalledWith('plant-1');
    expect(fetchPort.fetch).toHaveBeenCalledTimes(1);
    expect(writePort.writeStructure).toHaveBeenCalledWith(fetchedPlant);
    expect(writePort.writeStructure).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });
});
