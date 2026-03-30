import { Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import envConfig from 'config/env.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MiddlewareConsumer, RouteInfo } from '@nestjs/common/interfaces';

import { ApiAuthVimarModule } from './api-auth-vimar/api-auth-vimar.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TokensModule } from './tokens/tokens.module';
import { DatabaseModule } from './database/database.module';
import { DeviceModule } from './device/device.module';
import { PlantModule } from './plant/plant.module';
import { CacheModule } from './cache/cache.module';
import { SubscriptionModule } from './subscription/subscription.module';

import { RawBodyMiddleware } from './middlewares/raw-body.middleware';
import { JsonBodyMiddleware } from './middlewares/json-body.middleware';

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
    CacheModule,
    SubscriptionModule,
    EventEmitterModule.forRoot(),
  ],
})
export class AppModule {
  private rawBodyParsingRoutes: Array<RouteInfo> = [
    {
      path: 'cache/update',
      method: RequestMethod.POST,
    },
  ];

  public configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes(...this.rawBodyParsingRoutes)
      .apply(JsonBodyMiddleware)
      .exclude(...this.rawBodyParsingRoutes)
      .forRoutes('*');
  }
}
