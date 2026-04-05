import { Inject } from '@nestjs/common';
import { PG_POOL } from '../../../database/database.module';
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
  constructor(@Inject(PG_POOL) private readonly pool) {}

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
    thresholdOperator: string,
    thresholdValue: string,
    armingTime: string,
    dearmingTime: string,
  ): Promise<AlarmRuleEntity> {
    const result = await this.pool.query(
      `INSERT INTO alarm_rule (id, name, threshold_operator, threshold_value, priority, 
       arming_time, dearming_time, is_armed, device_id)
       VALUES ($1, $2, $3, $4, $5, $6::time, $7::time, $8, $9)
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
      ],
    );
    return result.rows[0];
  }

  async getAllAlarmRules(): Promise<AlarmRuleEntity[]> {
    const result = await this.pool.query(
      `SELECT * FROM alarm_rule 
       ORDER BY created_at ASC`,
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
    const result = await this.pool.query(
      `SELECT * FROM alarm_rule 
      WHERE arming_time <= $1 
        AND dearming_time >= $1
        AND device_id = $2
        AND is_armed = true
        AND (
          (
            threshold_value IN ('on','off') 
            AND $3 IN ('on','off')
            AND threshold_operator = '='
            AND threshold_value = $3
          )
          OR
          (
            threshold_value NOT IN ('on','off')
            AND $3 NOT IN ('on','off')
            AND (
              (threshold_operator = '>'  AND $3::numeric > threshold_value::numeric) OR
              (threshold_operator = '<'  AND $3::numeric < threshold_value::numeric) OR
              (threshold_operator = '='  AND $3::numeric = threshold_value::numeric) OR
              (threshold_operator = '>=' AND $3::numeric >= threshold_value::numeric) OR
              (threshold_operator = '<=' AND $3::numeric <= threshold_value::numeric)
            )
          )
        )`,
      [activationTime, deviceId, value],
    );

    return result.rows[0];
  }
}
