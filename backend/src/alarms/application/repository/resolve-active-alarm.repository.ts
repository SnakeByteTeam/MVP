import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { InjectPool } from '../../../database/database.module';
import { ResolveActiveAlarmPort } from '../ports/out/find-active-alarms.port';

@Injectable()
export class ResolveActiveAlarmRepository implements ResolveActiveAlarmPort {
  constructor(@InjectPool() private readonly pool: Pool) {}

  async resolve(id: string, resolvedAt: Date): Promise<void> {
    await this.pool.query(
      'UPDATE active_alarms SET resolved_at = $2 WHERE id = $1',
      [id, resolvedAt],
    );
  }
}
