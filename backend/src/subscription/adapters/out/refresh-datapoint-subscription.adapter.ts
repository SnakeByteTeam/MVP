import { Injectable, Inject } from '@nestjs/common';
import {
  type GetValidTokenPort,
  GETVALIDTOKENPORT,
} from 'src/api-auth-vimar/application/ports/out/get-valid-token.port';
import { RefreshDatapointSubCmd } from 'src/subscription/application/commands/refresh-datapoint-sub.command';
import { RefreshDatapointSubPort } from 'src/subscription/application/ports/out/refresh-datapoint-subscription.port';
import {
  REFRESH_DATAPOINT_SUBSCRIPTION_REPO_PORT,
  type RefreshDatapointSubRepoPort,
} from 'src/subscription/application/repository/refresh-datapoint-subscription.respository';

@Injectable()
export class RefreshDatapointSubAdapter implements RefreshDatapointSubPort {
  constructor(
    @Inject(REFRESH_DATAPOINT_SUBSCRIPTION_REPO_PORT)
    private readonly datapointRepo: RefreshDatapointSubRepoPort,
    @Inject(GETVALIDTOKENPORT)
    private readonly getValidTokenPort: GetValidTokenPort,
  ) {}

  async refreshDatapointSub(cmd: RefreshDatapointSubCmd): Promise<boolean> {
    if (!cmd?.plantId) throw new Error('PlantId is null');

    const validToken: string | null =
      await this.getValidTokenPort.getValidToken();
    if (!validToken) throw new Error('No valid token found');

    return await this.datapointRepo.refreshDatapointSub(
      validToken,
      cmd.plantId,
    );
  }
}
