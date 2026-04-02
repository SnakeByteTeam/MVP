
import { AuthModule } from './auth/auth.module';
import { WardsModule } from './wards/wards.module';
import { DatabaseModule } from './database/database.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ApiAuthVimarModule } from './api-auth-vimar/api-auth-vimar.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { DeviceModule } from './device/device.module';
import { PlantModule } from './plant/plant.module';
import { AlarmsModule } from './alarms/alarms.module';
import { CacheModule } from './cache/cache.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { UsersModule } from './users/users.module';
import { SuggestionModule } from './suggestion/suggestion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '../.env'],
    }),
    AnalyticsModule,
    ApiAuthVimarModule,
    DatabaseModule,
    DeviceModule,
    PlantModule,
    AuthModule,
    WardsModule, AlarmsModule,
    CacheModule,
    SubscriptionModule,
    EventEmitterModule.forRoot(), UsersModule, SuggestionModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

