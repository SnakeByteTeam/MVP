import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  REFRESH_NODE_SUBSCRIPTION_PORT,
  type RefreshNodeSubscriptionPort,
} from '../ports/out/refresh-node-subscription.port';
import {
  GET_ALL_PLANTIDS_PORT,
  type GetAllPlantIdsPort,
} from 'src/cache/application/ports/out/get-all-plantids.port';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(REFRESH_NODE_SUBSCRIPTION_PORT)
    private readonly refreshPort: RefreshNodeSubscriptionPort,
    @Inject(GET_ALL_PLANTIDS_PORT)
    private readonly getAllPlantIdsPort: GetAllPlantIdsPort,
  ) {}

  @OnEvent('fetched.tokens')
  async renewNodeSubcription() {
    const plantIds: string[] = await this.getAllPlantIdsPort.getAllPlantIds();

    if (plantIds.length === 0) {
      console.warn('No plant IDs found. Skipping subscription refresh.');
      return;
    }

    try {
      for (const plantId of plantIds) {
        console.log(`Refreshing node subscription for plantId: ${plantId}`);
        const refreshResult = await this.refreshPort.refreshSub({
          plantId: plantId,
        });

        if (!refreshResult) {
          console.error('Failed to refresh node subscription');
        } else {
          console.log('Node subscription refreshed successfully');
        }
      }
    } catch (error) {
      console.error('Error refreshing node subscription:', error);
    }
  }
}
