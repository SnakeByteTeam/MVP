import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { InjectPool } from '../../../database/database.module';
import { UpdateAlarmPort } from '../ports/out/update-alarm.port';
import { UpdateAlarmCmd } from '../commands/update-alarm.cmd';
import { Alarm } from '../../domain/models/alarm.model';
import { AlarmEntity } from '../../infrastructure/entities/alarm.entity';
import { toModel } from './alarm-mapper';

@Injectable()
export class UpdateAlarmRepository implements UpdateAlarmPort {
  constructor(@InjectPool() private readonly pool: Pool) {}

  async updateAlarm(id: string, cmd: UpdateAlarmCmd): Promise<Alarm> {
    const { rows } = await this.pool.query<AlarmEntity>(
      `UPDATE alarms SET
        priority          = COALESCE($2, priority),
        threshold         = COALESCE($3, threshold),
        activation_time   = COALESCE($4, activation_time),
        deactivation_time = COALESCE($5, deactivation_time),
        enabled           = COALESCE($6, enabled),
        updated_at        = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, cmd.priority, cmd.threshold, cmd.activationTime, cmd.deactivationTime, cmd.enabled],
    );
    return toModel(rows[0]);
  }
}
