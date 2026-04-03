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
  constructor(
    @Inject(REFRESH_NODE_SUBSCRIPTION_USECASE)
    private readonly refreshNodeSub: RefreshNodeSubUseCase,
    @Inject(REFRESH_DATAPOINT_SUBSCRIPTION_USECASE)
    private readonly refreshDatapointSub: RefreshDatapointSubUseCase,
    @Inject(REFRESH_ALL_SUBSCRIPTION_USECASE)
    private readonly refreshAllSub: RefreshAllSubscriptionUseCase,
  ) {}

  @OnEvent('fetched.tokens')
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

  @OnEvent('fetched.tokens')
  @Cron('0 0 1 * *', {
    //eseguito ogni primo giorno del mese a mezzanotte
    name: 'subscription-renewal-node',
    timeZone: 'UTC',
  })
  async refreshDatapointSubscriptions(): Promise<void> {
    try {
      await this.refreshDatapointSub.refreshDatapointSub();
    } catch (err) {
      console.error(err);
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
