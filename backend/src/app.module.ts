import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AlarmsModule } from './alarms/alarms.module';
import { ValidationModule } from './validation/validation.module';
import { GuardModule } from './guard/guard.module';

@Module({
  imports: [DatabaseModule, AlarmsModule, ValidationModule, GuardModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
