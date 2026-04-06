import { Inject } from '@nestjs/common';
import { PG_POOL } from '../../../database/database.module';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import { DeleteAlarmRuleRepository } from '../../application/repository/delete-alarm-rule-repository.interface';
import { GetAllAlarmRulesRepository } from '../../application/repository/get-all-alarm-rules-repository.interface';
import { AlarmPriority } from '../../domain/models/alarm-priority.enum';
import { AlarmRuleEntity } from '../entities/alarm-rule-entity';
import { CreateAlarmRuleRepository } from '../../application/repository/create-alarm-rule-repository.interface';
import { UpdateAlarmRuleRepository } from '../../application/repository/update-alarm-rule-repository.interface';
import { GetAlarmRuleByIdRepository } from '../../application/repository/get-alarm-rule-by-id-repository.interface';
import { CheckAlarmRuleRepository } from '../../application/repository/check-alarm-rule-repository.interface';
import { CheckAlarmEntity } from '../entities/check-alarm-entity';

export class AlarmRulesRepositoryImpl
  implements
    CreateAlarmRuleRepository,
    GetAlarmRuleByIdRepository,
    GetAllAlarmRulesRepository,
    DeleteAlarmRuleRepository,
    UpdateAlarmRuleRepository,
    CheckAlarmRuleRepository
{
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async getAlarmRuleById(id: string): Promise<AlarmRuleEntity | null> {
    const result = await this.pool.query(
      `SELECT * FROM alarm_rule
       WHERE id = $1`,
      [id],
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async createAlarmRule(
    name: string,
    priority: AlarmPriority,
    deviceId: string,
    plantId: string,
    thresholdOperator: string,
    thresholdValue: string,
    armingTime: string,
    dearmingTime: string,
  ): Promise<AlarmRuleEntity> {
    const result = await this.pool.query(
      `INSERT INTO alarm_rule (id, name, threshold_operator, threshold_value, priority, 
       arming_time, dearming_time, is_armed, device_id, plant_id)
       VALUES ($1, $2, $3, $4, $5, $6::time, $7::time, $8, $9, $10)
       RETURNING *`,
      [
        randomUUID(),
        name,
        thresholdOperator,
        thresholdValue,
        priority,
        armingTime,
        dearmingTime,
        true,
        deviceId,
        plantId
      ],
    );
    return result.rows[0];
  }

  async getAllAlarmRules(): Promise<AlarmRuleEntity[]> {
    const result = await this.pool.query(
      `SELECT * FROM alarm_rule 
       ORDER BY updated_at DESC, created_at DESC`,
    );
    return result.rows;
  }

  async deleteAlarmRule(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM alarm_rule WHERE id = $1`, [id]);
  }

  async updateAlarmRule(
    id: string,
    name: string,
    priority: AlarmPriority,
    thresholdOperator: string,
    thresholdValue: string,
    armingTime: string,
    dearmingTime: string,
    isArmed: boolean,
  ): Promise<AlarmRuleEntity> {
    const result = await this.pool.query(
      `UPDATE alarm_rule SET
        name = $2,
        priority = $3,
        threshold_operator = $4,
        threshold_value = $5,
        arming_time = $6,
        dearming_time = $7,
        is_armed = $8,
        updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
      [
        id,
        name,
        priority,
        thresholdOperator,
        thresholdValue,
        armingTime,
        dearmingTime,
        isArmed,
      ],
    );
    return result.rows[0];
  }

  async checkAlarmRule(
    deviceId: string,
    value: string,
    activationTime: string,
  ): Promise<CheckAlarmEntity | null> {
    const result = await this.pool.query<CheckAlarmEntity>(
      `SELECT
        ar.id AS alarm_rule_id,
        ward_match.ward_id,
        NULL::varchar AS alarm_event_id
      FROM alarm_rule ar
      LEFT JOIN LATERAL (
        SELECT p.ward_id
        FROM plant p
        JOIN LATERAL jsonb_array_elements(COALESCE(p.data->'rooms', '[]'::jsonb)) room ON TRUE
        JOIN LATERAL jsonb_array_elements(COALESCE(room->'devices', '[]'::jsonb)) dev ON TRUE
        WHERE dev->>'id' = ar.device_id
        ORDER BY p.cached_at DESC
        LIMIT 1
      ) ward_match ON TRUE
      WHERE ar.device_id = $2
        AND ar.is_armed = true
        AND (
          (
            ar.arming_time <= ar.dearming_time
            AND $1::time >= ar.arming_time
            AND $1::time <= ar.dearming_time
          )
          OR
          (
            ar.arming_time > ar.dearming_time
            AND (
              $1::time >= ar.arming_time
              OR $1::time <= ar.dearming_time
            )
          )
        )
        AND (
          (
            lower(ar.threshold_value) IN ('on','off')
            AND lower($3) IN ('on','off')
            AND ar.threshold_operator = '='
            AND lower(ar.threshold_value) = lower($3)
          )
          OR
          (
            lower(ar.threshold_value) NOT IN ('on','off')
            AND lower($3) NOT IN ('on','off')
            AND ar.threshold_value ~ '^[+-]?[0-9]+([.][0-9]+)?$'
            AND $3 ~ '^[+-]?[0-9]+([.][0-9]+)?$'
            AND (
              (ar.threshold_operator = '>'  AND $3::numeric > ar.threshold_value::numeric) OR
              (ar.threshold_operator = '<'  AND $3::numeric < ar.threshold_value::numeric) OR
              (ar.threshold_operator = '='  AND $3::numeric = ar.threshold_value::numeric) OR
              (ar.threshold_operator = '>=' AND $3::numeric >= ar.threshold_value::numeric) OR
              (ar.threshold_operator = '<=' AND $3::numeric <= ar.threshold_value::numeric)
            )
          )
        )
      LIMIT 1`,
      [activationTime, deviceId, value],
    );

    return result.rows[0];
  }
}
