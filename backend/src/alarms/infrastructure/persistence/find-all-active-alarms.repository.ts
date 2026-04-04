// import { Injectable } from '@nestjs/common';
// import { Pool } from 'pg';
// import { InjectPool } from '../../../database/database.module';
// import { FindAllActiveAlarmsPort } from '../ports/out/find-active-alarms.port';
// import { ActiveAlarm } from '../../domain/models/alarm-event.model';
// import { ActiveAlarmEntity } from '../entities/alarm-rule-entity';
// import { toActiveModel } from './active-alarm-mapper';

// @Injectable()
// export class FindAllActiveAlarmsRepository implements FindAllActiveAlarmsPort {
//   constructor(@InjectPool() private readonly pool: Pool) {}

//   async findAllActive(): Promise<ActiveAlarm[]> {
//     const { rows } = await this.pool.query<ActiveAlarmEntity>(
//       'SELECT * FROM active_alarms WHERE resolved_at IS NULL ORDER BY triggered_at DESC',
//     );
//     return rows.map(toActiveModel);
//   }
// }
