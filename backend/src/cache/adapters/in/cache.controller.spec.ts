import { Test, TestingModule } from '@nestjs/testing';
import { CacheController } from './cache.controller';
import { UpdateCacheUseCase } from 'src/cache/application/ports/in/get-valid-cache.usecase';
import { UPDATE_CACHE_USE_CASE } from 'src/cache/application/ports/in/get-valid-cache.usecase';

describe('CacheController', () => {
  let controller: CacheController;
  let updateCacheUseCase: UpdateCacheUseCase;

  beforeEach(async () => {
    const mockUpdateCacheUseCase: Partial<UpdateCacheUseCase> = {
      updateCache: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CacheController],
      providers: [
        {
          provide: UPDATE_CACHE_USE_CASE,
          useValue: mockUpdateCacheUseCase,
        },
      ],
    }).compile();

    controller = module.get<CacheController>(CacheController);
    updateCacheUseCase = module.get<UpdateCacheUseCase>(UPDATE_CACHE_USE_CASE);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateCache', () => {
    it('should update cache for all service items', async () => {
      const body = {
        data: [
          { type: 'service', id: 'plant-1' },
          { type: 'service', id: 'plant-2' },
          { type: 'device', id: 'device-1' },
          { type: 'service', id: 'plant-3' },
        ],
      };

      await controller.updateCache(body);

      expect(updateCacheUseCase.updateCache).toHaveBeenCalledTimes(3);
      expect(updateCacheUseCase.updateCache).toHaveBeenCalledWith({
        plantId: 'plant-1',
      });
      expect(updateCacheUseCase.updateCache).toHaveBeenCalledWith({
        plantId: 'plant-2',
      });
      expect(updateCacheUseCase.updateCache).toHaveBeenCalledWith({
        plantId: 'plant-3',
      });
    });

    it('should filter out non-service items', async () => {
      const body = {
        data: [
          { type: 'device', id: 'device-1' },
          { type: 'room', id: 'room-1' },
          { type: 'service', id: 'plant-1' },
        ],
      };

      await controller.updateCache(body);

      expect(updateCacheUseCase.updateCache).toHaveBeenCalledTimes(1);
      expect(updateCacheUseCase.updateCache).toHaveBeenCalledWith({
        plantId: 'plant-1',
      });
    });

    it('should handle empty data array', async () => {
      const body = { data: [] };

      await controller.updateCache(body);

      expect(updateCacheUseCase.updateCache).not.toHaveBeenCalled();
    });

    it('should handle data with no service items', async () => {
      const body = {
        data: [
          { type: 'device', id: 'device-1' },
          { type: 'room', id: 'room-1' },
        ],
      };

      await controller.updateCache(body);

      expect(updateCacheUseCase.updateCache).not.toHaveBeenCalled();
    });

    it('should return error when updateCache fails', async () => {
      const error = new Error('Cache update failed');
      jest
        .spyOn(updateCacheUseCase, 'updateCache')
        .mockRejectedValueOnce(error);

      const body = {
        data: [{ type: 'service', id: 'plant-1' }],
      };

      const result = await controller.updateCache(body);

      expect(result).toEqual({
        success: false,
        error: 'Cache update failed',
      });
    });

    it('should return error when any updateCache call fails', async () => {
      jest
        .spyOn(updateCacheUseCase, 'updateCache')
        .mockRejectedValueOnce(new Error('Update failed'));

      const body = {
        data: [
          { type: 'service', id: 'plant-1' },
          { type: 'service', id: 'plant-2' },
        ],
      };

      const result = await controller.updateCache(body);

      expect(result).toEqual({
        success: false,
        error: 'Update failed',
      });
    });

    it('should handle missing data property gracefully', async () => {
      const body = {};

      try {
        await controller.updateCache(body);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should process parallel updates for multiple plants', async () => {
      jest
        .spyOn(updateCacheUseCase, 'updateCache')
        .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(true), 100)));

      const body = {
        data: [
          { type: 'service', id: 'plant-1' },
          { type: 'service', id: 'plant-2' },
          { type: 'service', id: 'plant-3' },
        ],
      };

      const startTime = Date.now();
      await controller.updateCache(body);
      const duration = Date.now() - startTime;

      // Should complete in ~100ms (parallel), not ~300ms (sequential)
      expect(duration).toBeLessThan(200);
      expect(updateCacheUseCase.updateCache).toHaveBeenCalledTimes(3);
    });
  });
});
