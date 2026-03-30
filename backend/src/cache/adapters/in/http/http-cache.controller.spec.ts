import { HttpCacheController } from './http-cache.controller';
import { UpdateCacheUseCase } from 'src/cache/application/ports/in/update-cache.usecase';

describe('CacheController', () => {
  let controller: HttpCacheController;
  let updateCacheUseCase: jest.Mocked<UpdateCacheUseCase>;

  beforeEach(() => {
    updateCacheUseCase = {
      updateCache: jest.fn().mockResolvedValue(true),
    } as any;

    controller = new HttpCacheController(updateCacheUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateCache', () => {
    it('should return 202 immediately', async () => {
      const body = {
        data: [
          {
            type: 'service',
            id: 'plant-1',
            attributes: { lastModified: '2026-01-01' },
            links: { self: '/' },
          },
        ],
      };

      const response = await controller.updateCache(body);

      expect(response.statusCode).toBe(202);
      expect(response.success).toBe(true);
    });

    it('should update cache for all service items asynchronously', async () => {
      const body = {
        data: [
          {
            type: 'service',
            id: 'plant-1',
            attributes: { lastModified: '2026-01-01' },
            links: { self: '/' },
          },
          {
            type: 'service',
            id: 'plant-2',
            attributes: { lastModified: '2026-01-01' },
            links: { self: '/' },
          },
          {
            type: 'device',
            id: 'device-1',
            attributes: { lastModified: '2026-01-01' },
            links: { self: '/' },
          },
          {
            type: 'service',
            id: 'plant-3',
            attributes: { lastModified: '2026-01-01' },
            links: { self: '/' },
          },
        ],
      };

      await controller.updateCache(body);

      // Wait for setImmediate to execute
      await new Promise((resolve) => setImmediate(resolve));

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
          {
            type: 'device',
            id: 'device-1',
            attributes: { lastModified: '2026-01-01' },
            links: { self: '/' },
          },
          {
            type: 'room',
            id: 'room-1',
            attributes: { lastModified: '2026-01-01' },
            links: { self: '/' },
          },
          {
            type: 'service',
            id: 'plant-1',
            attributes: { lastModified: '2026-01-01' },
            links: { self: '/' },
          },
        ],
      };

      await controller.updateCache(body);

      // Wait for setImmediate to execute
      await new Promise((resolve) => setImmediate(resolve));

      expect(updateCacheUseCase.updateCache).toHaveBeenCalledTimes(1);
      expect(updateCacheUseCase.updateCache).toHaveBeenCalledWith({
        plantId: 'plant-1',
      });
    });

    it('should handle empty data array', async () => {
      const body = { data: [] };

      await controller.updateCache(body);

      // Wait for setImmediate to execute
      await new Promise((resolve) => setImmediate(resolve));

      expect(updateCacheUseCase.updateCache).not.toHaveBeenCalled();
    });

    it('should handle data with no service items', async () => {
      const body = {
        data: [
          {
            type: 'device',
            id: 'device-1',
            attributes: { lastModified: '2026-01-01' },
            links: { self: '/' },
          },
          {
            type: 'room',
            id: 'room-1',
            attributes: { lastModified: '2026-01-01' },
            links: { self: '/' },
          },
        ],
      };

      await controller.updateCache(body);

      // Wait for setImmediate to execute
      await new Promise((resolve) => setImmediate(resolve));

      expect(updateCacheUseCase.updateCache).not.toHaveBeenCalled();
    });

    it('should process updates sequentially', async () => {
      const callOrder: string[] = [];
      (updateCacheUseCase.updateCache as jest.Mock).mockImplementation(
        (cmd) =>
          new Promise((resolve) => {
            callOrder.push(cmd.plantId);
            setTimeout(() => resolve(true), 50);
          }),
      );

      const body = {
        data: [
          {
            type: 'service',
            id: 'plant-1',
            attributes: { lastModified: '2026-01-01' },
            links: { self: '/' },
          },
          {
            type: 'service',
            id: 'plant-2',
            attributes: { lastModified: '2026-01-01' },
            links: { self: '/' },
          },
          {
            type: 'service',
            id: 'plant-3',
            attributes: { lastModified: '2026-01-01' },
            links: { self: '/' },
          },
        ],
      };

      await controller.updateCache(body);

      // Wait for setImmediate and all updates to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(updateCacheUseCase.updateCache).toHaveBeenCalledTimes(3);
      expect(callOrder).toEqual(['plant-1', 'plant-2', 'plant-3']);
    });
  });
});
