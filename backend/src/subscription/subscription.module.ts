import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ApiAuthVimarModule } from 'src/api-auth-vimar/api-auth-vimar.module';

import { REFRESH_NODE_SUBSCRIPTION_PORT } from './application/ports/out/refresh-node-subscription.port';
import { RefreshNodeSubscriptionAdapter } from './adapters/out/refresh-node-subscription.adapter';
import { REFRESH_NODE_SUBSCRIPTION_REPO_PORT } from './application/repository/refresh-node-subscription.repository';
import { SubscriptionRepoImpl } from './infrastructure/http/sub-repo-impl';
import { SubscriptionService } from './application/services/subscription.service';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  imports: [ApiAuthVimarModule, HttpModule, CacheModule],
  providers: [
    SubscriptionService,
    {
      provide: REFRESH_NODE_SUBSCRIPTION_PORT,
      useClass: RefreshNodeSubscriptionAdapter,
    },
    {
      provide: REFRESH_NODE_SUBSCRIPTION_REPO_PORT,
      useClass: SubscriptionRepoImpl,
    },
  ],
})
export class SubscriptionModule {}
