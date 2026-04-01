import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AlarmsModule } from './alarms/alarms.module';
import { ValidationModule } from './validation/validation.module';

@Module({
  imports: [DatabaseModule, AlarmsModule, ValidationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
