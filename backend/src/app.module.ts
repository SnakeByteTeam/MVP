import { Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MiddlewareConsumer, RouteInfo } from '@nestjs/common/interfaces';

import { ApiAuthVimarModule } from './api-auth-vimar/api-auth-vimar.module';
import { AnalyticsModule } from './analytics/analytics.module';

import { DatabaseModule } from './database/database.module';
import { DeviceModule } from './device/device.module';
import { PlantModule } from './plant/plant.module';
import { SuggestionModule } from './suggestion/suggestion.module';
import { CacheModule } from './cache/cache.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AnalyticsModule,
    ApiAuthVimarModule,
    DatabaseModule,
    DeviceModule,
    PlantModule,
    SuggestionModule,
    CacheModule,
    SubscriptionModule,
    EventEmitterModule.forRoot(),
  ],
})
export class AppModule {}
