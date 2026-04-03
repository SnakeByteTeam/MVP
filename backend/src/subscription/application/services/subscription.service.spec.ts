import { RefreshNodeSubscriptionPort } from 'src/subscription/application/ports/out/refresh-node-subscription.port';
import { GetAllPlantIdsPort } from 'src/cache/application/ports/out/get-all-plantids.port';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let refreshPort: jest.Mocked<RefreshNodeSubscriptionPort>;
  let getAllPlantIdsPort: jest.Mocked<GetAllPlantIdsPort>;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    refreshPort = {
      refreshSub: jest.fn(),
    };
    getAllPlantIdsPort = {
      getAllPlantIds: jest.fn(),
    };

    service = new SubscriptionService(refreshPort, getAllPlantIdsPort);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('renewNodeSubcription', () => {
    it('should refresh subscriptions for all plants', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue([
        'plant-1',
        'plant-2',
      ]);
      refreshPort.refreshSub
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      await service.renewNodeSubcription();

      expect(getAllPlantIdsPort.getAllPlantIds).toHaveBeenCalledTimes(1);
      expect(refreshPort.refreshSub).toHaveBeenCalledTimes(2);
      expect(refreshPort.refreshSub).toHaveBeenCalledWith({
        plantId: 'plant-1',
      });
      expect(refreshPort.refreshSub).toHaveBeenCalledWith({
        plantId: 'plant-2',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Refreshing node subscription'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('successfully'),
      );
    });

    it('should log warning when no plant IDs found', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue([]);

      await service.renewNodeSubcription();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'No plant IDs found. Skipping subscription refresh.',
      );
    });

    it('should continue with next plant when refresh fails for one plant', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue([
        'plant-1',
        'plant-2',
      ]);
      refreshPort.refreshSub
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      await service.renewNodeSubcription();

      expect(refreshPort.refreshSub).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to refresh node subscription',
      );
    });

    it('should handle errors during refresh', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue(['plant-1']);
      refreshPort.refreshSub.mockRejectedValue(new Error('Refresh error'));

      await service.renewNodeSubcription();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error refreshing node subscription:',
        expect.any(Error),
      );
    });

    it('should handle error when getAllPlantIds fails', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockRejectedValue(
        new Error('Get IDs error'),
      );

      // The error is thrown since it's outside the try-catch
      await expect(service.renewNodeSubcription()).rejects.toThrow(
        'Get IDs error',
      );
    });

    it('should process multiple plants sequentially', async () => {
      const plantIds = ['plant-1', 'plant-2', 'plant-3'];
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue(plantIds);
      refreshPort.refreshSub.mockResolvedValue(true);

      await service.renewNodeSubcription();

      expect(refreshPort.refreshSub).toHaveBeenCalledTimes(3);
      expect(consoleLogSpy).toHaveBeenCalledTimes(6); // 3 log + 3 success messages
    });
  });
});
