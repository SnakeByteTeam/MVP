import { Module } from '@nestjs/common';
import { WardsModule } from './wards/wards.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [WardsModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
