import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiAuthVimarModule } from './api-auth-vimar/api-auth-vimar.module';

@Module({
  imports: [ApiAuthVimarModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
