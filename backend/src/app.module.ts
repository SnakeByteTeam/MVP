import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { WardsModule } from './wards/wards.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [AuthModule, DatabaseModule, WardsModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
