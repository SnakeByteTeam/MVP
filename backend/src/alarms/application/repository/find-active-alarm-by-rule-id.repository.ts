import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { InjectPool } from '../../../database/database.module';
import { FindActiveAlarmByRuleIdPort } from '../ports/out/find-active-alarms.port';
import { ActiveAlarm } from '../../domain/models/active-alarm.model';
import { ActiveAlarmEntity } from '../../infrastructure/entities/alarm.entity';
import { toActiveModel } from './active-alarm-mapper';

@Injectable()
export class FindActiveAlarmByRuleIdRepository implements FindActiveAlarmByRuleIdPort {
  constructor(@InjectPool() private readonly pool: Pool) {}

  // Controlla se esiste già un allarme attivo (non risolto) per questa regola.
  // Questo controllo evita duplicati quando il sensore continua
  // a mandare valori oltre soglia.
  async findActiveByRuleId(alarmRuleId: string): Promise<ActiveAlarm | null> {
    const { rows } = await this.pool.query<ActiveAlarmEntity>(
      'SELECT * FROM active_alarms WHERE alarm_rule_id = $1 AND resolved_at IS NULL LIMIT 1',
      [alarmRuleId],
    );
    return rows[0] ? toActiveModel(rows[0]) : null;
  }
}
