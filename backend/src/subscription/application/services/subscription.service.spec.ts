import { RefreshNodeSubscriptionPort } from 'src/subscription/application/ports/out/refresh-node-subscription.port';
import { GetAllPlantIdsPort } from 'src/cache/application/ports/out/get-all-plantids.port';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let refreshPort: jest.Mocked<RefreshNodeSubscriptionPort>;
  let getAllPlantIdsPort: jest.Mocked<GetAllPlantIdsPort>;

  beforeEach(() => {
    refreshPort = {
      refreshSub: jest.fn(),
    };
    getAllPlantIdsPort = {
      getAllPlantIds: jest.fn(),
    };

    service = new SubscriptionService(refreshPort, getAllPlantIdsPort);
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

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.renewNodeSubcription();

      expect(getAllPlantIdsPort.getAllPlantIds).toHaveBeenCalledTimes(1);
      expect(refreshPort.refreshSub).toHaveBeenCalledTimes(2);
      expect(refreshPort.refreshSub).toHaveBeenCalledWith({
        plantId: 'plant-1',
      });
      expect(refreshPort.refreshSub).toHaveBeenCalledWith({
        plantId: 'plant-2',
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Refreshing node subscription'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('successfully'),
      );

      consoleSpy.mockRestore();
    });

    it('should log warning when no plant IDs found', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue([]);

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await service.renewNodeSubcription();

      expect(warnSpy).toHaveBeenCalledWith(
        'No plant IDs found. Skipping subscription refresh.',
      );

      warnSpy.mockRestore();
    });

    it('should continue with next plant when refresh fails for one plant', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue([
        'plant-1',
        'plant-2',
      ]);
      refreshPort.refreshSub
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.renewNodeSubcription();

      expect(refreshPort.refreshSub).toHaveBeenCalledTimes(2);
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to refresh node subscription',
      );

      errorSpy.mockRestore();
    });

    it('should handle errors during refresh', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue(['plant-1']);
      refreshPort.refreshSub.mockRejectedValue(new Error('Refresh error'));

      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.renewNodeSubcription();

      expect(errorSpy).toHaveBeenCalledWith(
        'Error refreshing node subscription:',
        expect.any(Error),
      );

      errorSpy.mockRestore();
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

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.renewNodeSubcription();

      expect(refreshPort.refreshSub).toHaveBeenCalledTimes(3);
      expect(consoleSpy).toHaveBeenCalledTimes(6); // 3 log + 3 success messages

      consoleSpy.mockRestore();
    });
  });
});
