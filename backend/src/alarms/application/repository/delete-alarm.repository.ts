import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { InjectPool } from '../../../database/database.module';
import { DeleteAlarmPort } from '../ports/out/delete-alarm.port';

@Injectable()
export class DeleteAlarmRepository implements DeleteAlarmPort {
  constructor(@InjectPool() private readonly pool: Pool) {}

  async deleteAlarm(id: string): Promise<void> {
    await this.pool.query('DELETE FROM alarms WHERE id = $1', [id]);
  }
}
