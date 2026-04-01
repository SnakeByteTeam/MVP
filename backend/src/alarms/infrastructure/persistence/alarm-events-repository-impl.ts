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
    const { rows } = await this.pool.query(
      'SELECT * FROM active_alarms WHERE resolved_at IS NULL ORDER BY triggered_at DESC',
    );
    return rows;
  }

  getAllAlarmEventsByUserId(id: string): Promise<AlarmEventEntity[]> {
    throw new Error('Method not implemented.');
  }

  async resolveAlarmEvent(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE active_alarms SET resolved_at = NOW() WHERE id = $1',
      [id],
    );
  }
}
