import {
  Controller,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
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
  ) {}

  @OnEvent('fetched.tokens')
  async refreshNodeSubscriptions(): Promise<boolean> {
    try {
      return await this.refreshNodeSub.refreshSub();
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  @OnEvent('fetched.tokens')
  async refreshDatapointSubscriptions(): Promise<boolean> {
    try {
      return await this.refreshDatapointSub.refreshDatapointSub();
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
