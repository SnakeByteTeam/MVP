import { Inject } from '@nestjs/common';
import { PG_POOL } from '../../../database/database.module';
import { ResolveActiveAlarmRepository } from '../../application/repository/resolve-active-alarm-repository.interface';
import { ActiveAlarmEntity } from '../entities/active-alarm-entity';
import { GetAllActiveAlarmsRepository } from '../../application/repository/get-all-active-alarms-repository.interface';

export class ActiveAlarmsRepositoryImpl
  implements ResolveActiveAlarmRepository, GetAllActiveAlarmsRepository
{
  constructor(@Inject(PG_POOL) private readonly pool) {}

  async resolveActiveAlarm(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE active_alarms SET resolved_at = NOW() WHERE id = $1',
      [id],
    );
  }

  async getAllActiveAlarms(): Promise<ActiveAlarmEntity[]> {
    const { rows } = await this.pool.query(
      'SELECT * FROM active_alarms WHERE resolved_at IS NULL ORDER BY triggered_at DESC',
    );
    return rows;
  }
}
