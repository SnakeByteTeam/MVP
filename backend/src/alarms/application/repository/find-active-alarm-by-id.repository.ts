import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../../../database/database.module';
import { FindActiveAlarmByIdPort } from '../ports/out/find-active-alarms.port';
import { ActiveAlarm } from '../../domain/models/active-alarm.model';
import { ActiveAlarmEntity } from '../../infrastructure/entities/alarm.entity';
import { toActiveModel } from './active-alarm-mapper';
import { Inject } from '@nestjs/common';

@Injectable()
export class FindActiveAlarmByIdRepository implements FindActiveAlarmByIdPort {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) { }

  async findById(id: string): Promise<ActiveAlarm | null> {
    const { rows } = await this.pool.query<ActiveAlarmEntity>(
      'SELECT * FROM active_alarms WHERE id = $1',
      [id],
    );
    return rows[0] ? toActiveModel(rows[0]) : null;
  }
}
