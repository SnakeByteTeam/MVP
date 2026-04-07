import { randomUUID } from 'crypto';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../../../database/database.module';
import { ResolveAlarmEventRepository } from '../../application/repository/resolve-alarm-event-repository.interface';
import { AlarmEventEntity } from '../entities/alarm-event-entity';
import { GetAllAlarmEventsRepository } from '../../application/repository/get-all-alarm-events-repository.interface';
import { GetAllManagedAlarmEventsByUserIdRepository } from '../../application/repository/get-all-managed-alarm-events-by-user-id-repository.interface';
import { CreateAlarmEventRepository } from '../../application/repository/create-alarm-event-repository.interface';
import { GetAllUnmanagedAlarmEventsByUserIdRepository } from '../../application/repository/get-all-unmanaged-alarm-events-by-user-id-repository.interface';
import { GetWardAlarmEventRepoPort } from 'src/alarms/application/repository/get-ward-alarm-rule.repository';

export class AlarmEventsRepositoryImpl
  implements
  ResolveAlarmEventRepository,
  GetAllAlarmEventsRepository,
  GetAllManagedAlarmEventsByUserIdRepository,
  GetAllUnmanagedAlarmEventsByUserIdRepository,
  CreateAlarmEventRepository, 
  GetWardAlarmEventRepoPort{

  constructor(@Inject(PG_POOL) private readonly pool: Pool) { }

  async getAllAlarmEvents(
    limit: number = 5,
    offset: number = 0,
  ): Promise<AlarmEventEntity[]> {
    const result = await this.pool.query(
      `SELECT 
        ae.id,
        p.data->>'name' AS plant_name,
        room->>'name' AS room_name,
        device->>'name' AS device_name,
        ar.device_id,
        ae.alarm_rule_id,
        ar.name AS alarm_name,
        ar.priority,
        ae.activation_time,
        ae.resolution_time,
        ae.user_id as user_id,
        (SELECT username FROM "user" WHERE id = ae.user_id LIMIT 1) as user_username
      FROM alarm_event ae
      LEFT JOIN alarm_rule ar ON ae.alarm_rule_id = ar.id
      LEFT JOIN plant p ON p.id = ar.plant_id
      LEFT JOIN LATERAL jsonb_array_elements(p.data->'rooms') AS room ON true
      LEFT JOIN LATERAL jsonb_array_elements(room->'devices') AS device ON true
      WHERE device->>'id' = ar.device_id
      ORDER BY
        ar.priority DESC,
        ae.activation_time ASC
      LIMIT $1 OFFSET $2;`,
      [limit, offset],
    );
    return result.rows;
  }

  async getAlarmEventById(id: string): Promise<AlarmEventEntity | null> {
    const result = await this.pool.query(
      `SELECT 
        ae.id,
        p.data->>'name' AS plant_name,
        room->>'name' AS room_name,
        device->>'name' AS device_name,
        ar.device_id,
        ae.alarm_rule_id,
        ar.name AS alarm_name,
        ar.priority,
        ae.activation_time,
        ae.resolution_time,
        ae.user_id as user_id,
        (SELECT username FROM "user" WHERE id = ae.user_id LIMIT 1) as user_username
      FROM alarm_event ae
      LEFT JOIN alarm_rule ar ON ae.alarm_rule_id = ar.id
      LEFT JOIN plant p ON p.id = ar.plant_id
      LEFT JOIN LATERAL jsonb_array_elements(p.data->'rooms') AS room ON true
      LEFT JOIN LATERAL jsonb_array_elements(room->'devices') AS device ON true
      WHERE device->>'id' = ar.device_id AND ae.id = $1;`,
      [id],
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async getAllManagedAlarmEventsByUserId(
    id: number,
    limit: number = 10,
    offset: number = 0,
  ): Promise<AlarmEventEntity[]> {
    const result = await this.pool.query(
      `SELECT 
        ae.id,
        p.data->>'name' AS plant_name,
        room->>'name' AS room_name,
        device->>'name' AS device_name,
        ar.device_id,
        ae.alarm_rule_id,
        ar.name AS alarm_name,
        ar.priority,
        ae.activation_time,
        ae.resolution_time,
        ae.user_id as user_id,
        (SELECT username FROM "user" WHERE id = ae.user_id LIMIT 1) as user_username
      FROM alarm_event ae
      LEFT JOIN alarm_rule ar ON ae.alarm_rule_id = ar.id
      LEFT JOIN plant p ON p.id = ar.plant_id
      JOIN "user" u_req ON u_req.id = $1
      JOIN role r ON r.id = u_req.roleId
      LEFT JOIN ward_user wu 
        ON wu.ward_id = p.ward_id AND wu.user_id = $1
      LEFT JOIN LATERAL jsonb_array_elements(p.data->'rooms') AS room ON true
      LEFT JOIN LATERAL jsonb_array_elements(room->'devices') AS device ON true
      WHERE device->>'id' = ar.device_id
      AND ae.resolution_time IS NOT NULL
      AND (
        r.name = 'Amministratore'
        OR wu.user_id IS NOT NULL
      )
      ORDER BY
        ar.priority DESC,
        ae.activation_time ASC
      LIMIT $2 OFFSET $3;`,
      [id, limit, offset],
    );

    return result.rows;
  }

  async getAllUnmanagedAlarmEventsByUserId(
    id: number,
    limit: number,
    offset: number,
  ): Promise<AlarmEventEntity[]> {
    const result = await this.pool.query(
      `SELECT 
        ae.id,
        p.data->>'name' AS plant_name,
        room->>'name' AS room_name,
        device->>'name' AS device_name,
        ar.device_id,
        ae.alarm_rule_id,
        ar.name AS alarm_name,
        ar.priority,
        ae.activation_time,
        NULL as resolution_time,
        0 as user_id,
        '' as user_username
      FROM alarm_event ae
      LEFT JOIN alarm_rule ar ON ae.alarm_rule_id = ar.id
      LEFT JOIN plant p ON p.id = ar.plant_id
      JOIN "user" u_req ON u_req.id = $1
      JOIN role r ON r.id = u_req.roleId
      LEFT JOIN ward_user wu 
        ON wu.ward_id = p.ward_id AND wu.user_id = $1
      LEFT JOIN LATERAL jsonb_array_elements(p.data->'rooms') AS room ON true
      LEFT JOIN LATERAL jsonb_array_elements(room->'devices') AS device ON true
      WHERE device->>'id' = ar.device_id
      AND ae.resolution_time IS NULL
      AND (
        r.name = 'Amministratore' 
        OR wu.user_id IS NOT NULL
      )
      ORDER BY
        ar.priority DESC,
        ae.activation_time ASC
      LIMIT $2 OFFSET $3;`,
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

  async getWardAlarmEvent(alarmId: string): Promise<number> {
    const result = await this.pool.query<{ ward_id: number | null }>(
      `SELECT p.ward_id
       FROM alarm_event ae
       JOIN alarm_rule ar ON ar.id = ae.alarm_rule_id
       JOIN plant p ON p.id = ar.plant_id
       WHERE ae.id = $1
       LIMIT 1`,
      [alarmId],
    );

    const wardId = result.rows[0]?.ward_id;

    if (wardId == null) {
      throw new Error(`Ward not found for alarm event ${alarmId}`);
    }

    return wardId;
  }
}
