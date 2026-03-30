import { Inject, Injectable } from '@nestjs/common';
import { RefreshNodeSubCmd } from 'src/subscription/application/commands/refresh-node-sub.command';
import { RefreshNodeSubscriptionPort } from 'src/subscription/application/ports/out/refresh-node-subscription.port';
import {
  REFRESH_NODE_SUBSCRIPTION_REPO_PORT,
  type RefreshNodeSubscriptionRepoPort,
} from 'src/subscription/application/repository/refresh-node-subscription.repository';
import {
  type GetValidTokenPort,
  GETVALIDTOKENPORT,
} from 'src/api-auth-vimar/application/ports/out/get-valid-token.port';

@Injectable()
export class RefreshNodeSubscriptionAdapter implements RefreshNodeSubscriptionPort {
  constructor(
    @Inject(REFRESH_NODE_SUBSCRIPTION_REPO_PORT)
    private readonly nodeRepo: RefreshNodeSubscriptionRepoPort,
    @Inject(GETVALIDTOKENPORT)
    private readonly getValidTokenPort: GetValidTokenPort,
  ) {}

  async refreshSub(cmd: RefreshNodeSubCmd): Promise<boolean> {
    if(!cmd?.plantId) throw new Error('PlantId is null');

    const validToken: string | null =
      await this.getValidTokenPort.getValidToken();
    if (!validToken) throw new Error('No valid token found');

    return await this.nodeRepo.refreshSub(validToken, cmd.plantId);
  }
}
