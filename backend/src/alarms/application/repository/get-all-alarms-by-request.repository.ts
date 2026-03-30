import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../../../database/database.module';
import { GetAllAlarmsByRequestPort } from '../ports/out/get-all-alarms-by-request.port';
import { Alarm } from '../../domain/models/alarm.model';
import { AlarmEntity } from '../../infrastructure/entities/alarm.entity';
import { toModel } from './alarm-mapper';
import { Inject } from '@nestjs/common';


@Injectable()
export class GetAllAlarmsByRequestRepository implements GetAllAlarmsByRequestPort {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) { }

  async getAllAlarmsByRequest(plantId?: string, deviceId?: string): Promise<Alarm[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (plantId) { conditions.push(`plant_id = $${i++}`); values.push(plantId); }
    if (deviceId) { conditions.push(`device_id = $${i++}`); values.push(deviceId); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await this.pool.query<AlarmEntity>(
      `SELECT * FROM alarms ${where}`,
      values,
    );
    return rows.map(toModel);
  }
}
