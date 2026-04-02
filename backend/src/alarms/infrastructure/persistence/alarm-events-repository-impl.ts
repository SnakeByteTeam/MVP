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

  async getAllAlarmEvents(limit: number = 5, offset: number = 0): Promise<AlarmEventEntity[]> {
    const result = await this.pool.query(
      'SELECT * FROM alarm_event ORDER BY activation_time DESC, resolution_time DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  async getAllAlarmEventsByUserId(id: number, limit: number = 10, offset: number = 0): Promise<AlarmEventEntity[]> {
    const result = await this.pool.query(
      'SELECT * FROM alarm_event WHERE id = $1 ORDER BY activation_time DESC LIMIT $2 OFFSET $3',
      [id, limit, offset],
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
