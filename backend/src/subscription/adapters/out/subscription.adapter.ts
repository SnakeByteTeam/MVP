import { Inject, Injectable } from '@nestjs/common';
import { RefreshNodeSubCmd } from 'src/subscription/application/commands/refresh-node-sub.command';
import { RefreshDatapointSubCmd } from 'src/subscription/application/commands/refresh-datapoint-sub.command';
import { RefreshNodeSubscriptionPort } from 'src/subscription/application/ports/out/refresh-node-subscription.port';
import { RefreshDatapointSubPort } from 'src/subscription/application/ports/out/refresh-datapoint-subscription.port';
import {
  SUBSCRIPTION_REPOSITORY_PORT,
  type SubscriptionRepositoryPort,
} from 'src/subscription/application/repository/subscription.repository';
import {
  type GetValidTokenPort,
  GETVALIDTOKENPORT,
} from 'src/api-auth-vimar/application/ports/out/get-valid-token.port';

@Injectable()
export class SubscriptionAdapter
  implements RefreshNodeSubscriptionPort, RefreshDatapointSubPort
{
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY_PORT)
    private readonly subscriptionRepository: SubscriptionRepositoryPort,
    @Inject(GETVALIDTOKENPORT)
    private readonly getValidTokenPort: GetValidTokenPort,
  ) {}

  async refreshSub(cmd: RefreshNodeSubCmd): Promise<boolean> {
    if (!cmd?.plantId) throw new Error('PlantId is null');

    const validToken: string | null =
      await this.getValidTokenPort.getValidToken();
    if (!validToken) throw new Error('No valid token found');

    return await this.subscriptionRepository.refreshSub(
      validToken,
      cmd.plantId,
    );
  }

  async refreshDatapointSub(cmd: RefreshDatapointSubCmd): Promise<boolean> {
    if (!cmd?.plantId) throw new Error('PlantId is null');

    const validToken: string | null =
      await this.getValidTokenPort.getValidToken();
    if (!validToken) throw new Error('No valid token found');

    return await this.subscriptionRepository.refreshDatapointSub(
      validToken,
      cmd.plantId,
    );
  }
}
