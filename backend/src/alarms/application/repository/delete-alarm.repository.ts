import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../../../database/database.module';
import { DeleteAlarmPort } from '../ports/out/delete-alarm.port';
import { Inject } from '@nestjs/common';

@Injectable()
export class DeleteAlarmRepository implements DeleteAlarmPort {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) { }

  async deleteAlarm(id: string): Promise<void> {
    await this.pool.query('DELETE FROM alarms WHERE id = $1', [id]);
  }
}
