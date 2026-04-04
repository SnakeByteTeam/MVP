import { v4 as uuidv4 } from 'uuid';
import { Inject } from '@nestjs/common';
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
  CreateAlarmEventRepository {
  constructor(@Inject(PG_POOL) private readonly pool) { }

  async getAllAlarmEvents(
    limit: number = 5,
    offset: number = 0,
  ): Promise<AlarmEventEntity[]> {
    const result = await this.pool.query(
      `SELECT 
         ae.id,
         '' AS room_name,
         ar.device_id AS device_name,
        ar.device_id AS device_id,
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
       WHERE ae.resolution_time IS NULL
          AND ae.alarm_rule_id IS NOT NULL
       ORDER BY ae.resolution_time IS NOT NULL,
       ar.priority DESC,
       ae.activation_time DESC
       LIMIT $1 OFFSET $2`,
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
        '' AS room_name,
        ar.device_id AS device_name,
        ar.device_id AS device_id,
        ae.alarm_rule_id,
        ar.name AS alarm_name,
        ar.priority,
        ae.activation_time,
        ae.resolution_time,
        ae.user_id,
        resolver.username as user_username
       FROM alarm_event ae
       LEFT JOIN alarm_rule ar ON ae.alarm_rule_id = ar.id
       LEFT JOIN plant p ON p.id = ar.plant_id
       LEFT JOIN ward_user wu ON wu.ward_id = p.ward_id
       LEFT JOIN "user" u ON u.id = wu.user_id
       LEFT JOIN "user" resolver ON resolver.id = ae.user_id
       WHERE u.id = $1
         AND ae.resolution_time IS NULL
        AND ae.alarm_rule_id IS NOT NULL
       ORDER BY ae.resolution_time IS NOT NULL,
       ar.priority DESC,
       ae.activation_time DESC
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
  ): Promise<void> {
    return await this.pool.query(
      `INSERT INTO alarm_event (id, alarm_rule_id, activation_time) VALUES ($1,$2,$3)`,
      [uuidv4(), alarmRuleId, activationTime],
    );
  }
}
