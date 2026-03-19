import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import envConfig from 'config/env.config';

import { AppService } from './app.service';
import { ApiAuthVimarModule } from './api-auth-vimar/api-auth-vimar.module';

import { TokensModule } from './tokens/tokens.module';
import { DatabaseModule } from './database/database.module';
import { DeviceModule } from './device/device.module';

@Module({
  imports: [ApiAuthVimarModule,
            TokensModule, 
            ConfigModule.forRoot({
              isGlobal: true, 
              load: [envConfig]
            }), 
            DatabaseModule, DeviceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
