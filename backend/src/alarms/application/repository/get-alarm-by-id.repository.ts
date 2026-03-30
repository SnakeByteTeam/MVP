import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { InjectPool } from '../../../database/database.module';
import { GetAlarmByIdPort } from '../ports/out/get-alarm-by-id.port';
import { Alarm } from '../../domain/models/alarm.model';
import { AlarmEntity } from '../../infrastructure/entities/alarm.entity';
import { toModel } from './alarm-mapper';

@Injectable()
export class GetAlarmByIdRepository implements GetAlarmByIdPort {
  constructor(@InjectPool() private readonly pool: Pool) {}

  async getAlarmById(id: string): Promise<Alarm | null> {
    const { rows } = await this.pool.query<AlarmEntity>(
      'SELECT * FROM alarms WHERE id = $1',
      [id],
    );
    return rows[0] ? toModel(rows[0]) : null;
  }
}
