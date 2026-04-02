import { Inject } from '@nestjs/common';
import { PG_POOL } from '../../../database/database.module';
import { ResolveAlarmEventRepository } from '../../application/repository/resolve-alarm-event-repository.interface';
import { AlarmEventEntity } from '../entities/alarm-event-entity';
import { GetAllAlarmEventsRepository } from '../../application/repository/get-all-alarm-events-repository.interface';
import { GetAllAlarmEventsByUserIdRepository } from '../../application/repository/get-all-alarm-events-by-user-id-repository.interface';

export class AlarmEventsRepositoryImpl
  implements
    ResolveAlarmEventRepository,
    GetAllAlarmEventsRepository,
    GetAllAlarmEventsByUserIdRepository
{
  constructor(@Inject(PG_POOL) private readonly pool) {}

  async getAllAlarmEvents(): Promise<AlarmEventEntity[]> {
    const result = await this.pool.query(
      'SELECT * FROM alarm_event ORDER BY activation_time DESC, resolution_time DESC',
    );
    return result.rows;
  }

  async getAllAlarmEventsByUserId(id: number): Promise<AlarmEventEntity[]> {
    const result = await this.pool.query(
      'SELECT * FROM alarm_event WHERE id = $1 ORDER BY activation_time DESC',
      [id],
    );

    return result.rows;
  }

  async resolveAlarmEvent(alarmId: string, userId: number): Promise<void> {
    await this.pool.query(
      'UPDATE alarm_event SET resolution_time = NOW(), user_id = $2 WHERE id = $1',
      [alarmId, userId],
    );
  }
}
