import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { InjectPool } from '../../../database/database.module';
import { GetAllAlarmsPort } from '../ports/out/get-all-alarms.port';
import { Alarm } from '../../domain/models/alarm.model';
import { AlarmEntity } from '../../infrastructure/entities/alarm.entity';
import { toModel } from './alarm-mapper';

@Injectable()
export class GetAllAlarmsRepository implements GetAllAlarmsPort {
  constructor(@InjectPool() private readonly pool: Pool) {}

  async getAllAlarms(): Promise<Alarm[]> {
    const { rows } = await this.pool.query<AlarmEntity>(
      'SELECT * FROM alarms ORDER BY created_at DESC',
    );
    return rows.map(toModel);
  }
}
