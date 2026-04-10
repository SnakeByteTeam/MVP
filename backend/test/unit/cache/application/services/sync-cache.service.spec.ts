import { Plant } from 'src/plant/domain/models/plant.model';
import { FetchNewCachePort } from 'src/cache/application/ports/out/fetch-new-cache.port';
import { WriteCachePort } from 'src/cache/application/ports/out/write-cache.port';
import { GetAllPlantIdsPort } from 'src/cache/application/ports/out/get-all-plantids.port';
import { SyncCacheService } from 'src/cache/application/services/sync-cache.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('SyncCacheService', () => {
  let service: SyncCacheService;
  let fetchPort: jest.Mocked<FetchNewCachePort>;
  let writePort: jest.Mocked<WriteCachePort>;
  let getAllPlantIdsPort: jest.Mocked<GetAllPlantIdsPort>;
  let emitter: jest.Mocked<EventEmitter2>;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    fetchPort = {
      fetch: jest.fn(),
    };

    writePort = {
      writeStructure: jest.fn(),
    };

    getAllPlantIdsPort = {
      getAllPlantIds: jest.fn(),
    };

    emitter = {
      emit: jest.fn(),
      emitAsync: jest.fn().mockResolvedValue([]),
    } as any;

    service = new SyncCacheService(
      fetchPort,
      writePort,
      getAllPlantIdsPort,
      emitter,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw PlantId is null when cmd.plantId is absent', async () => {
    await expect(service.updateCache({ plantId: '' })).rejects.toThrow(
      new Error('PlantId is null'),
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
    expect(emitter.emit).toHaveBeenCalledWith('cache.updated', {
      plantId: 'plant-1',
    });
  });

  it('should throw error when write cache fails', async () => {
    const fetchedPlant = new Plant('plant-1', 'New Plant', [], 1);
    fetchPort.fetch.mockResolvedValue(fetchedPlant);
    writePort.writeStructure.mockResolvedValue(false);

    await expect(service.updateCache({ plantId: 'plant-1' })).rejects.toThrow(
      new Error('Failed to write cache'),
    );
  });

  it('should propagate fetch errors', async () => {
    const fetchError = new Error('API call failed');
    fetchPort.fetch.mockRejectedValue(fetchError);

    await expect(service.updateCache({ plantId: 'plant-1' })).rejects.toThrow(
      fetchError,
    );
  });

  describe('updateAllCache', () => {
    it('should update cache for all plants', async () => {
      const plant1 = new Plant('plant-1', 'Plant 1', [], 1);
      const plant2 = new Plant('plant-2', 'Plant 2', [], 2);

      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue([
        'plant-1',
        'plant-2',
      ]);
      fetchPort.fetch
        .mockResolvedValueOnce(plant1)
        .mockResolvedValueOnce(plant2);
      writePort.writeStructure
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      const result = await service.updateAllCache();

      expect(result).toBe(true);
      expect(getAllPlantIdsPort.getAllPlantIds).toHaveBeenCalledTimes(1);
      expect(fetchPort.fetch).toHaveBeenCalledTimes(2);
      expect(writePort.writeStructure).toHaveBeenCalledTimes(2);
      expect(emitter.emit).toHaveBeenCalledWith('cache.all.updated');
    });

    it('should continue with next plant when fetch fails for one plant', async () => {
      const plant2 = new Plant('plant-2', 'Plant 2', [], 2);

      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue([
        'plant-1',
        'plant-2',
      ]);
      fetchPort.fetch
        .mockRejectedValueOnce(new Error('Fetch failed for plant-1'))
        .mockResolvedValueOnce(plant2);
      writePort.writeStructure.mockResolvedValue(true);

      const result = await service.updateAllCache();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error updating cache for plantId: plant-1'),
      );
      expect(writePort.writeStructure).toHaveBeenCalledTimes(1);
      expect(writePort.writeStructure).toHaveBeenCalledWith(plant2);
      expect(emitter.emit).toHaveBeenCalledWith('cache.all.updated');
    });

    it('should continue with next plant when write fails for one plant', async () => {
      const plant1 = new Plant('plant-1', 'Plant 1', [], 1);
      const plant2 = new Plant('plant-2', 'Plant 2', [], 2);

      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue([
        'plant-1',
        'plant-2',
      ]);
      fetchPort.fetch
        .mockResolvedValueOnce(plant1)
        .mockResolvedValueOnce(plant2);
      writePort.writeStructure
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      const result = await service.updateAllCache();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error updating cache for plantId: plant-1'),
      );
      expect(emitter.emit).toHaveBeenCalledWith('cache.all.updated');
    });

    it('should log success message when cache is updated for a plant', async () => {
      const plant1 = new Plant('plant-1', 'Plant 1', [], 1);

      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue(['plant-1']);
      fetchPort.fetch.mockResolvedValue(plant1);
      writePort.writeStructure.mockResolvedValue(true);

      const result = await service.updateAllCache();

      expect(result).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Cache updated successfully for plantId: plant-1',
      );
    });

    it('should handle empty plant ids list', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue([]);

      const result = await service.updateAllCache();

      expect(result).toBe(true);
      expect(fetchPort.fetch).not.toHaveBeenCalled();
      expect(writePort.writeStructure).not.toHaveBeenCalled();
    });

    it('should propagate error when getAllPlantIds fails', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockRejectedValue(
        new Error('Failed to get plant ids'),
      );

      await expect(service.updateAllCache()).rejects.toThrow(
        'Failed to get plant ids',
      );
    });
  });
});
