import { RefreshNodeSubscriptionPort } from 'src/subscription/application/ports/out/refresh-node-subscription.port';
import { GetAllPlantIdsPort } from 'src/cache/application/ports/out/get-all-plantids.port';
import { RefreshDatapointSubPort } from 'src/subscription/application/ports/out/refresh-datapoint-subscription.port';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let refreshNodePort: jest.Mocked<RefreshNodeSubscriptionPort>;
  let refreshDatapointPort: jest.Mocked<RefreshDatapointSubPort>;
  let getAllPlantIdsPort: jest.Mocked<GetAllPlantIdsPort>;

  beforeEach(() => {
    refreshNodePort = {
      refreshSub: jest.fn(),
    };
    refreshDatapointPort = {
      refreshDatapointSub: jest.fn(),
    };
    getAllPlantIdsPort = {
      getAllPlantIds: jest.fn(),
    };

    service = new SubscriptionService(
      refreshNodePort,
      refreshDatapointPort,
      getAllPlantIdsPort,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('refreshSub', () => {
    it('should refresh node subscriptions for all plants successfully', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue([
        'plant-1',
        'plant-2',
      ]);
      refreshNodePort.refreshSub
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await service.refreshSub();

      expect(result).toBe(true);
      expect(getAllPlantIdsPort.getAllPlantIds).toHaveBeenCalledTimes(1);
      expect(refreshNodePort.refreshSub).toHaveBeenCalledTimes(2);
      expect(refreshNodePort.refreshSub).toHaveBeenCalledWith({
        plantId: 'plant-1',
      });
      expect(refreshNodePort.refreshSub).toHaveBeenCalledWith({
        plantId: 'plant-2',
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Refreshing node subscription for plantId: plant-1',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Node subscription refreshed successfully for plant: plant-1',
      );
    });

    it('should throw error when no plant IDs found for refreshSub', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue([]);

      await expect(service.refreshSub()).rejects.toThrow('No plant IDs found.');
    });

    it('should continue with next plant when refresh fails for one plant', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue([
        'plant-1',
        'plant-2',
      ]);
      refreshNodePort.refreshSub
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.refreshSub();

      expect(refreshNodePort.refreshSub).toHaveBeenCalledTimes(2);
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to refresh node subscription for plant: plant-1',
      );
    });

    it('should handle errors during node subscription refresh', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue(['plant-1']);
      refreshNodePort.refreshSub.mockRejectedValue(new Error('Refresh error'));

      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(service.refreshSub()).rejects.toThrow('Refresh error');
      expect(errorSpy).toHaveBeenCalledWith(
        'Error refreshing node subscription:',
        expect.any(Error),
      );
    });

    it('should log successful refresh for each plant', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue([
        'plant-1',
        'plant-2',
        'plant-3',
      ]);
      refreshNodePort.refreshSub
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.refreshSub();

      expect(consoleSpy).toHaveBeenCalledTimes(6); // 3x start + 3x success
      expect(consoleSpy).toHaveBeenCalledWith(
        'Node subscription refreshed successfully for plant: plant-3',
      );
    });

    it('should process multiple plants in sequence', async () => {
      const plantIds = ['plant-1', 'plant-2'];
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue(plantIds);
      refreshNodePort.refreshSub
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      await service.refreshSub();

      const calls = (refreshNodePort.refreshSub as jest.Mock).mock.calls;
      expect(calls.length).toBe(2);
      expect(calls[0][0]).toEqual({ plantId: 'plant-1' });
      expect(calls[1][0]).toEqual({ plantId: 'plant-2' });
    });
  });

  describe('refreshDatapointSub', () => {
    it('should refresh datapoint subscriptions for all plants successfully', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue([
        'plant-1',
        'plant-2',
      ]);
      refreshDatapointPort.refreshDatapointSub
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await service.refreshDatapointSub();

      expect(result).toBe(true);
      expect(getAllPlantIdsPort.getAllPlantIds).toHaveBeenCalledTimes(1);
      expect(refreshDatapointPort.refreshDatapointSub).toHaveBeenCalledTimes(2);
      expect(refreshDatapointPort.refreshDatapointSub).toHaveBeenCalledWith({
        plantId: 'plant-1',
      });
      expect(refreshDatapointPort.refreshDatapointSub).toHaveBeenCalledWith({
        plantId: 'plant-2',
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Refreshing datapoint subscription for plantId: plant-1',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Datapoint subscription refreshed successfully for plant: plant-1',
      );
    });

    it('should throw error when no plant IDs found for refreshDatapointSub', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue([]);

      await expect(service.refreshDatapointSub()).rejects.toThrow(
        'No plant IDs found.',
      );
    });

    it('should continue with next plant when datapoint refresh fails for one plant', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue([
        'plant-1',
        'plant-2',
      ]);
      refreshDatapointPort.refreshDatapointSub
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.refreshDatapointSub();

      expect(refreshDatapointPort.refreshDatapointSub).toHaveBeenCalledTimes(2);
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to refresh datapoint subscription for plant: plant-1',
      );
    });

    it('should handle errors during datapoint subscription refresh', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue(['plant-1']);
      refreshDatapointPort.refreshDatapointSub.mockRejectedValue(
        new Error('Datapoint refresh error'),
      );

      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(service.refreshDatapointSub()).rejects.toThrow(
        'Datapoint refresh error',
      );
      expect(errorSpy).toHaveBeenCalledWith(
        'Error refreshing datapoint subscription:',
        expect.any(Error),
      );
    });

    it('should log successful datapoint refresh for each plant', async () => {
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue([
        'plant-a',
        'plant-b',
      ]);
      refreshDatapointPort.refreshDatapointSub
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.refreshDatapointSub();

      expect(consoleSpy).toHaveBeenCalledTimes(4); // 2x start + 2x success
      expect(consoleSpy).toHaveBeenCalledWith(
        'Datapoint subscription refreshed successfully for plant: plant-a',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Datapoint subscription refreshed successfully for plant: plant-b',
      );
    });

    it('should process datapoint subscriptions in sequence', async () => {
      const plantIds = ['plant-1', 'plant-2', 'plant-3'];
      getAllPlantIdsPort.getAllPlantIds.mockResolvedValue(plantIds);
      refreshDatapointPort.refreshDatapointSub
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      await service.refreshDatapointSub();

      const calls = (refreshDatapointPort.refreshDatapointSub as jest.Mock).mock
        .calls;
      expect(calls.length).toBe(3);
      plantIds.forEach((plantId, index) => {
        expect(calls[index][0]).toEqual({ plantId });
      });
    });
  });
});
