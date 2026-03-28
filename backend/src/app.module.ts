import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import envConfig from 'config/env.config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ApiAuthVimarModule } from './api-auth-vimar/api-auth-vimar.module';
import { AnalyticsModule } from './analytics/analytics.module';

import { TokensModule } from './tokens/tokens.module';
import { DatabaseModule } from './database/database.module';
import { DeviceModule } from './device/device.module';
import { PlantModule } from './plant/plant.module';
import { SuggestionModule } from './suggestion/suggestion.module';
import { CacheModule } from './cache/cache.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    AnalyticsModule,
    ApiAuthVimarModule,
    TokensModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
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
