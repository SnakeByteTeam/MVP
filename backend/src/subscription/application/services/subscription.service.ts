import { Inject, Injectable } from '@nestjs/common';

import {
  REFRESH_NODE_SUBSCRIPTION_PORT,
  type RefreshNodeSubscriptionPort,
} from '../ports/out/refresh-node-subscription.port';
import {
  GET_ALL_PLANTIDS_PORT,
  type GetAllPlantIdsPort,
} from 'src/cache/application/ports/out/get-all-plantids.port';
import { RefreshNodeSubUseCase } from '../ports/in/refresh-node-subscription.usecase';
import { RefreshDatapointSubUseCase } from '../ports/in/refresh-datapoint-subscription.usecase';
import {
  REFRESH_DATAPOINT_SUBSCRIPTION_PORT,
  type RefreshDatapointSubPort,
} from '../ports/out/refresh-datapoint-subscription.port';

@Injectable()
export class SubscriptionService
  implements RefreshNodeSubUseCase, RefreshDatapointSubUseCase
{
  constructor(
    @Inject(REFRESH_NODE_SUBSCRIPTION_PORT)
    private readonly refreshPort: RefreshNodeSubscriptionPort,
    @Inject(REFRESH_DATAPOINT_SUBSCRIPTION_PORT)
    private readonly refreshDatapointPort: RefreshDatapointSubPort,
    @Inject(GET_ALL_PLANTIDS_PORT)
    private readonly getAllPlantIdsPort: GetAllPlantIdsPort,
  ) {}

  async refreshSub(): Promise<boolean> {
    const plantIds: string[] = await this.getAllPlantIdsPort.getAllPlantIds();

    if (plantIds.length === 0) throw new Error('No plant IDs found.');

    try {
      for (const plantId of plantIds) {
        console.log(`Refreshing node subscription for plantId: ${plantId}`);
        const refreshResult = await this.refreshPort.refreshSub({
          plantId: plantId,
        });

        if (!refreshResult) {
          console.error(
            `Failed to refresh node subscription for plant: ${plantId}`,
          );
        } else {
          console.log(
            `Node subscription refreshed successfully for plant: ${plantId}`,
          );
        }
      }

      return true;
    } catch (error) {
      console.error('Error refreshing node subscription:', error);
      throw error;
    }
  }

  async refreshDatapointSub(): Promise<boolean> {
    const plantIds: string[] = await this.getAllPlantIdsPort.getAllPlantIds();

    if (plantIds.length === 0) throw new Error('No plant IDs found.');

    try {
      for (const plantId of plantIds) {
        console.log(
          `Refreshing datapoint subscription for plantId: ${plantId}`,
        );
        const refreshResult =
          await this.refreshDatapointPort.refreshDatapointSub({
            plantId: plantId,
          });

        if (!refreshResult) {
          console.error(
            `Failed to refresh datapoint subscription for plant: ${plantId}`,
          );
        } else {
          console.log(
            `Datapoint subscription refreshed successfully for plant: ${plantId}`,
          );
        }
      }
      return true;
    } catch (error) {
      console.error('Error refreshing datapoint subscription:', error);
      throw error;
    }
  }
}
