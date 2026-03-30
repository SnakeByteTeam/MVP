import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../../../database/database.module';
import { ResolveActiveAlarmPort } from '../ports/out/find-active-alarms.port';
import { Inject } from '@nestjs/common';


@Injectable()
export class ResolveActiveAlarmRepository implements ResolveActiveAlarmPort {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) { }

  async resolve(id: string, resolvedAt: Date): Promise<void> {
    await this.pool.query(
      'UPDATE active_alarms SET resolved_at = $2 WHERE id = $1',
      [id, resolvedAt],
    );
  }
}
