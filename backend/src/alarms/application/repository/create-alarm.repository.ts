import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { randomUUID } from 'node:crypto';
import { PG_POOL } from '../../../database/database.module';
import { CreateAlarmPort } from '../ports/out/create-alarm.port';
import { CreateAlarmCmd } from '../commands/create-alarm.cmd';
import { Alarm } from '../../domain/models/alarm.model';
import { AlarmEntity } from '../../infrastructure/entities/alarm.entity';
import { toModel } from './alarm-mapper';

@Injectable()
export class CreateAlarmRepository implements CreateAlarmPort {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) { }

  async createAlarm(cmd: CreateAlarmCmd): Promise<Alarm> {
    const { rows } = await this.pool.query<AlarmEntity>(
      `INSERT INTO alarms (id, name, plant_id, device_id, priority, threshold, activation_time, deactivation_time, enabled, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [randomUUID(), cmd.name, cmd.plantId, cmd.deviceId, cmd.priority, cmd.threshold,
      cmd.activationTime, cmd.deactivationTime, true, new Date(), new Date()],
    );
    return toModel(rows[0]);
  }
}
