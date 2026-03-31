import { HttpCacheController } from './http-cache.controller';
import { UpdateCacheUseCase } from 'src/cache/application/ports/in/update-cache.usecase';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('HttpCacheController', () => {
  let controller: HttpCacheController;
  let updateCacheUseCase: jest.Mocked<UpdateCacheUseCase>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(() => {
    updateCacheUseCase = {
      updateCache: jest.fn().mockResolvedValue(true),
    } as any;

    eventEmitter = {
      emit: jest.fn(),
      emitAsync: jest.fn(),
    } as any;

    controller = new HttpCacheController(updateCacheUseCase, eventEmitter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateCache', () => {
    it('should return 202 immediately with success message', async () => {
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
      expect(response.message).toContain('Processing update for 1 plant(s)');
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

    it('should emit cache.updated event for each plant', async () => {
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
        ],
      };

      await controller.updateCache(body);

      // Wait for setImmediate to execute
      await new Promise((resolve) => setImmediate(resolve));

      expect(eventEmitter.emit).toHaveBeenCalledTimes(2);
      expect(eventEmitter.emit).toHaveBeenCalledWith('cache.updated', {
        plantId: 'plant-1',
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('cache.updated', {
        plantId: 'plant-2',
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

      const response = await controller.updateCache(body);

      expect(response.statusCode).toBe(202);
      expect(response.success).toBe(true);
      expect(response.message).toContain('Processing update for 0 plant(s)');

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

      const response = await controller.updateCache(body);

      expect(response.statusCode).toBe(202);
      expect(response.message).toContain('Processing update for 0 plant(s)');

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

    it('should handle updateCache errors gracefully', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      (updateCacheUseCase.updateCache as jest.Mock)
        .mockRejectedValueOnce(new Error('Update failed'))
        .mockResolvedValueOnce(true);

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
        ],
      };

      const response = await controller.updateCache(body);

      expect(response.statusCode).toBe(202);

      // Wait for setImmediate to execute
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(updateCacheUseCase.updateCache).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[CacheController] Error updating cache'),
        expect.any(String),
      );

      consoleSpy.mockRestore();
    });

    it('should emit event even if updateCache fails', async () => {
      (updateCacheUseCase.updateCache as jest.Mock).mockRejectedValue(
        new Error('Update failed'),
      );
      jest.spyOn(console, 'error').mockImplementation(() => {});

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

      await controller.updateCache(body);

      // Wait for setImmediate to execute
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(eventEmitter.emit).toHaveBeenCalledWith('cache.updated', {
        plantId: 'plant-1',
      });
    });

    it('should include correct count in response message', async () => {
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

      const response = await controller.updateCache(body);

      expect(response.message).toBe(
        'Webhook accepted. Processing update for 3 plant(s)',
      );
    });
  });
});
