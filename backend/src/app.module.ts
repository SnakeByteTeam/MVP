import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WardsModule } from './wards/wards.module';

@Module({
  imports: [WardsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
