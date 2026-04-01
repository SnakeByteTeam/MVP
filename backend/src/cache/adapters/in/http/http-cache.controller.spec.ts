import { HttpCacheController } from './http-cache.controller';
import { UpdateCacheUseCase } from 'src/cache/application/ports/in/update-cache.usecase';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('HttpCacheController', () => {
  let controller: HttpCacheController;
  let updateCacheUseCase: jest.Mocked<UpdateCacheUseCase>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let setImmediateSpy: jest.SpyInstance;

  beforeEach(() => {
    updateCacheUseCase = {
      updateCache: jest.fn().mockResolvedValue(true),
    } as any;

    eventEmitter = {
      emit: jest.fn(),
      emitAsync: jest.fn(),
    } as any;

    controller = new HttpCacheController(updateCacheUseCase, eventEmitter);

    // Run setImmediate callbacks synchronously only for this suite
    setImmediateSpy = jest
      .spyOn(global, 'setImmediate')
      .mockImplementation((cb: (...args: any[]) => void, ...args: any[]) => {
        cb(...args);
        return 0 as any;
      });
  });

  afterEach(() => {
    jest.clearAllMocks();

    if (setImmediateSpy) {
      setImmediateSpy.mockRestore();
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateCache', () => {
    const flushPromises = () => new Promise(setImmediate);
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

      await flushPromises();

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

      await flushPromises();

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

      await flushPromises();

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

      await flushPromises();
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

      await new Promise(setImmediate);
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

      await flushPromises();

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

      await flushPromises();

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
