import { randomUUID } from 'crypto';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../../../database/database.module';
import { ResolveAlarmEventRepository } from '../../application/repository/resolve-alarm-event-repository.interface';
import { AlarmEventEntity } from '../entities/alarm-event-entity';
import { GetAllAlarmEventsRepository } from '../../application/repository/get-all-alarm-events-repository.interface';
import { GetAllAlarmEventsByUserIdRepository } from '../../application/repository/get-all-alarm-events-by-user-id-repository.interface';
import { CreateAlarmEventRepository } from '../../application/repository/create-alarm-event-repository.interface';

export class AlarmEventsRepositoryImpl
  implements
    ResolveAlarmEventRepository,
    GetAllAlarmEventsRepository,
    GetAllAlarmEventsByUserIdRepository,
    CreateAlarmEventRepository
{
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async getAllAlarmEvents(
    limit: number = 5,
    offset: number = 0,
  ): Promise<AlarmEventEntity[]> {
    const result = await this.pool.query(
      `SELECT 
        ae.id,
        room->>'name' AS room_name,
        device->>'name' AS device_name,
        ae.alarm_rule_id,
        ar.name AS alarm_name,
        ar.priority,
        ae.activation_time,
        ae.resolution_time,
        ae.user_id,
        u.username as user_username
      FROM alarm_event ae
      LEFT JOIN alarm_rule ar ON ae.alarm_rule_id = ar.id
      LEFT JOIN "user" u ON u.id = ae.user_id
      LEFT JOIN plant p ON p.id = ar.plant_id
      LEFT JOIN LATERAL jsonb_array_elements(p.data->'rooms') AS room ON true
      LEFT JOIN LATERAL jsonb_array_elements(room->'devices') AS device ON true
      LEFT JOIN LATERAL jsonb_array_elements(device->'datapoints') AS dp ON true
      WHERE dp->>'id' = ar.device_id
      AND ae.resolution_time IS NULL
      ORDER BY 
        ae.resolution_time IS NOT NULL,
        ar.priority DESC,
        ae.activation_time DESC
      LIMIT $1 OFFSET $2;`,
      [limit, offset],
    );
    return result.rows;
  }

  async getAllAlarmEventsByUserId(
    id: number,
    limit: number = 10,
    offset: number = 0,
  ): Promise<AlarmEventEntity[]> {
    const result = await this.pool.query(
      `SELECT 
        ae.id,
        room->>'name' AS room_name,
        device->>'name' AS device_name,
        ae.alarm_rule_id,
        ar.name AS alarm_name,
        ar.priority,
        ae.activation_time,
        ae.resolution_time,
        0 as user_id,
        '' as user_username
      FROM alarm_event ae
      LEFT JOIN alarm_rule ar ON ae.alarm_rule_id = ar.id
      LEFT JOIN plant p ON p.id = ar.plant_id
      INNER JOIN ward_user wu ON wu.ward_id = p.ward_id AND wu.user_id = $1
      LEFT JOIN "user" u ON u.id = wu.user_id
      LEFT JOIN LATERAL jsonb_array_elements(p.data->'rooms') AS room ON true
      LEFT JOIN LATERAL jsonb_array_elements(room->'devices') AS device ON true
      LEFT JOIN LATERAL jsonb_array_elements(device->'datapoints') AS dp ON true
      WHERE dp->>'id' = ar.device_id
            AND ae.resolution_time IS NULL

      ORDER BY 
        ae.resolution_time IS NOT NULL,
        ar.priority DESC,
        ae.activation_time ASC
      LIMIT $2 OFFSET $3`,
      [id, limit, offset],
    );

    return result.rows;
  }

  async resolveAlarmEvent(alarmId: string, userId: number): Promise<void> {
    await this.pool.query(
      `UPDATE alarm_event SET resolution_time = NOW(), user_id = $2 
      WHERE id = $1`,
      [alarmId, userId],
    );
  }

  async createAlarmEvent(
    alarmRuleId: string,
    activationTime: Date,
  ): Promise<string> {
    const result = await this.pool.query<{ id: string }>(
      `INSERT INTO alarm_event (id, alarm_rule_id, activation_time)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [randomUUID(), alarmRuleId, activationTime],
    );

    return result.rows[0]?.id ?? '';
  }
}
