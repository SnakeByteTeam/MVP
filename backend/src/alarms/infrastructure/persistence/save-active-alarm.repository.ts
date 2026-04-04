// import { Injectable } from '@nestjs/common';
// import { Pool } from 'pg';
// import { InjectPool } from '../../../database/database.module';
// import { SaveActiveAlarmPort } from '../ports/out/find-active-alarms.port';
// import { ActiveAlarm } from '../../domain/models/alarm-event.model';
// import { ActiveAlarmEntity } from '../entities/alarm-rule-entity';
// import { toActiveModel } from './active-alarm-mapper';

// @Injectable()
// export class SaveActiveAlarmRepository implements SaveActiveAlarmPort {
//   constructor(@InjectPool() private readonly pool: Pool) {}

//   async save(alarm: ActiveAlarm): Promise<ActiveAlarm> {
//     const { rows } = await this.pool.query<ActiveAlarmEntity>(
//       `INSERT INTO active_alarms (id, alarm_rule_id, alarm_name, danger_signal, triggered_at, resolved_at)
//        VALUES ($1,$2,$3,$4,$5,$6)
//        RETURNING *`,
//       [
//         alarm.id,
//         alarm.alarmId,
//         alarm.alarmName,
//         alarm.dangerSignal,
//         alarm.triggeredAt,
//         alarm.resolvedAt,
//       ],
//     );
//     return toActiveModel(rows[0]);
//   }
// }
