import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { ApiAuthVimarModule } from 'src/api-auth-vimar/api-auth-vimar.module';
import { CacheModule } from 'src/cache/cache.module';

import { EventSubscriptionController } from './adapters/in/event/event-sub.controller';

import { REFRESH_NODE_SUBSCRIPTION_PORT } from './application/ports/out/refresh-node-subscription.port';
import { REFRESH_NODE_SUBSCRIPTION_REPO_PORT } from './application/repository/refresh-node-subscription.repository';
import { REFRESH_NODE_SUBSCRIPTION_USECASE } from './application/ports/in/refresh-node-subscription.usecase';
import { REFRESH_DATAPOINT_SUBSCRIPTION_USECASE } from './application/ports/in/refresh-datapoint-subscription.usecase';
import { REFRESH_DATAPOINT_SUBSCRIPTION_PORT } from './application/ports/out/refresh-datapoint-subscription.port';
import { REFRESH_DATAPOINT_SUBSCRIPTION_REPO_PORT } from './application/repository/refresh-datapoint-subscription.respository';
import { REFRESH_ALL_SUBSCRIPTION_USECASE } from './application/ports/in/refresh-all-subscription.usecase';

import { SubscriptionRepoImpl } from './infrastructure/http/sub-repo-impl';
import { SubscriptionService } from './application/services/subscription.service';
import { RefreshNodeSubscriptionAdapter } from './adapters/out/refresh-node-subscription.adapter';
import { RefreshDatapointSubAdapter } from './adapters/out/refresh-datapoint-subscription.adapter';

@Module({
  imports: [
    ApiAuthVimarModule,
    HttpModule,
    CacheModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [EventSubscriptionController],
  providers: [
    {
      provide: REFRESH_NODE_SUBSCRIPTION_PORT,
      useClass: RefreshNodeSubscriptionAdapter,
    },
    {
      provide: REFRESH_NODE_SUBSCRIPTION_REPO_PORT,
      useClass: SubscriptionRepoImpl,
    },
    {
      provide: REFRESH_NODE_SUBSCRIPTION_USECASE,
      useClass: SubscriptionService,
    },
    {
      provide: REFRESH_DATAPOINT_SUBSCRIPTION_USECASE,
      useClass: SubscriptionService,
    },
    {
      provide: REFRESH_DATAPOINT_SUBSCRIPTION_PORT,
      useClass: RefreshDatapointSubAdapter,
    },
    {
      provide: REFRESH_DATAPOINT_SUBSCRIPTION_REPO_PORT,
      useClass: SubscriptionRepoImpl,
    },
    {
      provide: REFRESH_ALL_SUBSCRIPTION_USECASE,
      useClass: SubscriptionService,
    },
  ],
})
export class SubscriptionModule {}
