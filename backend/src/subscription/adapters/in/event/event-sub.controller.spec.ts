import { Test, TestingModule } from '@nestjs/testing';
import { EventSubscriptionController } from './event-sub.controller';
import {
  REFRESH_NODE_SUBSCRIPTION_USECASE,
  type RefreshNodeSubUseCase,
} from 'src/subscription/application/ports/in/refresh-node-subscription.usecase';
import {
  REFRESH_DATAPOINT_SUBSCRIPTION_USECASE,
  type RefreshDatapointSubUseCase,
} from 'src/subscription/application/ports/in/refresh-datapoint-subscription.usecase';
import {
  REFRESH_ALL_SUBSCRIPTION_USECASE,
  type RefreshAllSubscriptionUseCase,
} from 'src/subscription/application/ports/in/refresh-all-subscription.usecase';

describe('EventSubscriptionController', () => {
  let controller: EventSubscriptionController;
  let refreshNodeSub: jest.Mocked<RefreshNodeSubUseCase>;
  let refreshDatapointSub: jest.Mocked<RefreshDatapointSubUseCase>;
  let refreshAllSub: jest.Mocked<RefreshAllSubscriptionUseCase>;

  beforeEach(async () => {
    refreshNodeSub = {
      refreshSub: jest.fn(),
    } as any;

    refreshDatapointSub = {
      refreshDatapointSub: jest.fn(),
    } as any;

    refreshAllSub = {
      refreshAllSubscription: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventSubscriptionController],
      providers: [
        {
          provide: REFRESH_NODE_SUBSCRIPTION_USECASE,
          useValue: refreshNodeSub,
        },
        {
          provide: REFRESH_DATAPOINT_SUBSCRIPTION_USECASE,
          useValue: refreshDatapointSub,
        },
        {
          provide: REFRESH_ALL_SUBSCRIPTION_USECASE,
          useValue: refreshAllSub,
        },
      ],
    }).compile();

    controller = module.get<EventSubscriptionController>(
      EventSubscriptionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('refreshNodeSubscriptions', () => {
    it('should call refreshNodeSub.refreshSub', async () => {
      refreshNodeSub.refreshSub.mockResolvedValue(true);

      await controller.refreshNodeSubscriptions();

      expect(refreshNodeSub.refreshSub).toHaveBeenCalledTimes(1);
    });

    it('should handle errors in refreshNodeSubscriptions', async () => {
      refreshNodeSub.refreshSub.mockRejectedValue(
        new Error('Node refresh error'),
      );
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      await controller.refreshNodeSubscriptions();

      expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('refreshDatapointSubscriptions', () => {
    it('should call refreshDatapointSub.refreshDatapointSub', async () => {
      refreshDatapointSub.refreshDatapointSub.mockResolvedValue(true);

      await controller.refreshDatapointSubscriptions();

      expect(refreshDatapointSub.refreshDatapointSub).toHaveBeenCalledTimes(1);
    });

    it('should handle errors in refreshDatapointSubscriptions', async () => {
      refreshDatapointSub.refreshDatapointSub.mockRejectedValue(
        new Error('Datapoint refresh error'),
      );
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      await controller.refreshDatapointSubscriptions();

      expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('refreshAllSubsByPlantId', () => {
    it('should call refreshAllSub.refreshAllSubscription with plantId', async () => {
      refreshAllSub.refreshAllSubscription.mockResolvedValue(true as any);
      const payload = { plantId: 'plant-123' };

      await controller.refreshAllSubsByPlantId(payload);

      expect(refreshAllSub.refreshAllSubscription).toHaveBeenCalledWith({
        plantId: 'plant-123',
      });
    });

    it('should throw error when plantId is null', async () => {
      const payload = { plantId: null as any };
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      await controller.refreshAllSubsByPlantId(payload);

      expect(errorSpy).toHaveBeenCalled();
    });

    it('should throw error when payload is null', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      await controller.refreshAllSubsByPlantId(null as any);

      expect(errorSpy).toHaveBeenCalled();
    });

    it('should handle errors in refreshAllSub', async () => {
      refreshAllSub.refreshAllSubscription.mockRejectedValue(
        new Error('All refresh error'),
      );
      const payload = { plantId: 'plant-456' };
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      await controller.refreshAllSubsByPlantId(payload);

      expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should process multiple plant refreshes', async () => {
      refreshAllSub.refreshAllSubscription.mockResolvedValue(true as any);

      const payload1 = { plantId: 'plant-1' };
      const payload2 = { plantId: 'plant-2' };

      await controller.refreshAllSubsByPlantId(payload1);
      await controller.refreshAllSubsByPlantId(payload2);

      expect(refreshAllSub.refreshAllSubscription).toHaveBeenCalledTimes(2);
    });
  });
});
