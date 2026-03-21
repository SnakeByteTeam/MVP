import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AlarmsModule } from './alarms/alarms.module';

@Module({
  imports: [
    DatabaseModule, // @Global() ->  pool disponibile in tutti i moduli
    AlarmsModule,
    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
