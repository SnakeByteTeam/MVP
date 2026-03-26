import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import envConfig from 'config/env.config';
import { ApiAuthVimarModule } from './api-auth-vimar/api-auth-vimar.module';

import { TokensModule } from './tokens/tokens.module';
import { DatabaseModule } from './database/database.module';
import { DeviceModule } from './device/device.module';
import { PlantModule } from './plant/plant.module';

@Module({
  imports: [
    ApiAuthVimarModule,
    TokensModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    DatabaseModule,
    DeviceModule,
    PlantModule,
  ],
})
export class AppModule {}
