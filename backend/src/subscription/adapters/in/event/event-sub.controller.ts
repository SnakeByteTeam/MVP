import { Controller, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OnEvent } from '@nestjs/event-emitter';
import {
  REFRESH_ALL_SUBSCRIPTION_USECASE,
  type RefreshAllSubscriptionUseCase,
} from 'src/subscription/application/ports/in/refresh-all-subscription.usecase';
import {
  REFRESH_DATAPOINT_SUBSCRIPTION_USECASE,
  type RefreshDatapointSubUseCase,
} from 'src/subscription/application/ports/in/refresh-datapoint-subscription.usecase';
import {
  REFRESH_NODE_SUBSCRIPTION_USECASE,
  type RefreshNodeSubUseCase,
} from 'src/subscription/application/ports/in/refresh-node-subscription.usecase';

@Controller()
export class EventSubscriptionController {
  private isBulkRefreshRunning = false;

  constructor(
    @Inject(REFRESH_NODE_SUBSCRIPTION_USECASE)
    private readonly refreshNodeSub: RefreshNodeSubUseCase,
    @Inject(REFRESH_DATAPOINT_SUBSCRIPTION_USECASE)
    private readonly refreshDatapointSub: RefreshDatapointSubUseCase,
    @Inject(REFRESH_ALL_SUBSCRIPTION_USECASE)
    private readonly refreshAllSub: RefreshAllSubscriptionUseCase,
  ) {}

  @Cron('0 0 1 * *', {
    //eseguito ogni primo giorno del mese a mezzanotte
    name: 'subscription-renewal-node',
    timeZone: 'UTC',
  })
  async refreshNodeSubscriptions(): Promise<void> {
    try {
      await this.refreshNodeSub.refreshSub();
    } catch (err) {
      console.error(err);
    }
  }

  @Cron('0 0 1 * *', {
    //eseguito ogni primo giorno del mese a mezzanotte
    name: 'subscription-renewal-datapoint',
    timeZone: 'UTC',
  })
  async refreshDatapointSubscriptions(): Promise<void> {
    try {
      await this.refreshDatapointSub.refreshDatapointSub();
    } catch (err) {
      console.error(err);
    }
  }

  @OnEvent('cache.all.updated')
  async refreshAllSubsAfterFullCacheSync(): Promise<void> {
    if (this.isBulkRefreshRunning) {
      console.warn(
        'Event received: cache.all.updated. Bulk subscription refresh already running, skipping duplicate event.',
      );
      return;
    }

    this.isBulkRefreshRunning = true;

    try {
      console.log(
        'Event received: cache.all.updated. Refreshing subscriptions for all plants...',
      );

      await this.refreshNodeSub.refreshSub();
      await this.refreshDatapointSub.refreshDatapointSub();
    } catch (err) {
      console.error(
        'Error refreshing subscriptions after full cache sync',
        err,
      );
    } finally {
      this.isBulkRefreshRunning = false;
    }
  }

  @OnEvent('cache.updated')
  async refreshAllSubsByPlantId(payload: { plantId: string }): Promise<void> {
    try {
      if (!payload?.plantId) throw new Error('PlantId is null');

      await this.refreshAllSub.refreshAllSubscription({
        plantId: payload.plantId,
      });
    } catch (err) {
      console.error(err);
    }
  }
}
