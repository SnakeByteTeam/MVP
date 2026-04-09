import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { ApiAuthVimarModule } from 'src/api-auth-vimar/api-auth-vimar.module';
import { CacheModule } from 'src/cache/cache.module';

import { EventSubscriptionController } from './adapters/in/event/event-sub.controller';

import { REFRESH_NODE_SUBSCRIPTION_PORT } from './application/ports/out/refresh-node-subscription.port';
import { REFRESH_NODE_SUBSCRIPTION_USECASE } from './application/ports/in/refresh-node-subscription.usecase';
import { REFRESH_DATAPOINT_SUBSCRIPTION_USECASE } from './application/ports/in/refresh-datapoint-subscription.usecase';
import { REFRESH_DATAPOINT_SUBSCRIPTION_PORT } from './application/ports/out/refresh-datapoint-subscription.port';
import { REFRESH_ALL_SUBSCRIPTION_USECASE } from './application/ports/in/refresh-all-subscription.usecase';

import { SubscriptionRepoImpl } from './infrastructure/http/sub-repo-impl';
import { SubscriptionService } from './application/services/subscription.service';
import { SubscriptionAdapter } from './adapters/out/subscription.adapter';
import {
  SUBSCRIPTION_REPOSITORY_PORT,
} from './application/repository/subscription.repository';

@Module({
  imports: [
    ApiAuthVimarModule,
    HttpModule,
    CacheModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [EventSubscriptionController],
  providers: [
    // Use cases
    {
      provide: REFRESH_NODE_SUBSCRIPTION_USECASE,
      useClass: SubscriptionService,
    },
    {
      provide: REFRESH_DATAPOINT_SUBSCRIPTION_USECASE,
      useClass: SubscriptionService,
    },
    {
      provide: REFRESH_ALL_SUBSCRIPTION_USECASE,
      useClass: SubscriptionService,
    },
    
    // Unified port & adapters
    { provide: SUBSCRIPTION_REPOSITORY_PORT, useClass: SubscriptionRepoImpl },
    { provide: REFRESH_NODE_SUBSCRIPTION_PORT, useClass: SubscriptionAdapter },
    { provide: REFRESH_DATAPOINT_SUBSCRIPTION_PORT, useClass: SubscriptionAdapter },
    
    // Standalone dependencies
    SubscriptionRepoImpl,
  ],
})
export class SubscriptionModule {}
