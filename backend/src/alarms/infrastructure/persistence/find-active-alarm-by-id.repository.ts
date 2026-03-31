// import { Injectable } from '@nestjs/common';
// import { Pool } from 'pg';
// import { InjectPool } from '../../../database/database.module';
// import { FindActiveAlarmByIdPort } from '../ports/out/find-active-alarms.port';
// import { ActiveAlarm } from '../../domain/models/alarm-event.model';
// import { ActiveAlarmEntity } from '../entities/alarm-rule-entity';
// import { toActiveModel } from './active-alarm-mapper';

// @Injectable()
// export class FindActiveAlarmByIdRepository implements FindActiveAlarmByIdPort {
//   constructor(@InjectPool() private readonly pool: Pool) {}

//   async findById(id: string): Promise<ActiveAlarm | null> {
//     const { rows } = await this.pool.query<ActiveAlarmEntity>(
//       'SELECT * FROM active_alarms WHERE id = $1',
//       [id],
//     );
//     return rows[0] ? toActiveModel(rows[0]) : null;
//   }
// }
