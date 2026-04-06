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
import { v4 as uuidv4 } from 'uuid';

export class AlarmRulesRepositoryImpl
  implements
  CreateAlarmRuleRepository,
  GetAlarmRuleByIdRepository,
  GetAllAlarmRulesRepository,
  DeleteAlarmRuleRepository,
  UpdateAlarmRuleRepository,
  CheckAlarmRuleRepository {
  constructor(@Inject(PG_POOL) private readonly pool) { }

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
        plantId,
      ],
    );
    return result.rows[0];
  }

  async getAllAlarmRules(): Promise<AlarmRuleEntity[]> {
    const result = await this.pool.query(
      `SELECT * FROM alarm_rule 
       WHERE is_changed_when_used = FALSE
       ORDER BY created_at DESC`,
    );
    return result.rows;
  }

  async deleteAlarmRule(id: string): Promise<void> {
    const deleteResult = await this.pool.query(
      `DELETE FROM alarm_rule
      WHERE id = $1
      AND NOT EXISTS (
        SELECT 1
        FROM alarm_event
        WHERE alarm_rule_id = $1
      )
      `,
      [id],
    );

    if (deleteResult.rowCount === 0) {
      await this.pool.query(
        `UPDATE alarm_rule
        SET is_changed_when_used = TRUE
        WHERE id = $1
        `,
        [id],
      );
    }
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
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const usageCheck = await client.query(
        `SELECT EXISTS (
          SELECT 1 FROM alarm_event WHERE alarm_rule_id = $1
        ) AS used
        `,
        [id],
      );

      const isUsed = usageCheck.rows[0].used;

      if (!isUsed) {
        const result = await client.query(
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
          RETURNING *
          `,
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

        await client.query('COMMIT');
        return result.rows[0];
      }

      await client.query(
        `UPDATE alarm_rule
        SET is_changed_when_used = TRUE,
          updated_at = NOW()
        WHERE id = $1
        `,
        [id],
      );

      const insertResult = await client.query(
        `INSERT INTO alarm_rule (
          id,
          name,
          threshold_operator,
          threshold_value,
          priority,
          arming_time,
          dearming_time,
          is_armed,
          device_id,
          plant_id,
          created_at,
          updated_at,
          is_changed_when_used
        )
        SELECT
          $2,                -- new id
          $3, $4, $5, $6, $7, $8, $9,
          device_id,
          plant_id,
          NOW(),
          NOW(),
          FALSE
        FROM alarm_rule
        WHERE id = $1
        RETURNING *
        `,
        [
          id,
          uuidv4(),
          name,
          thresholdOperator,
          thresholdValue,
          priority,
          armingTime,
          dearmingTime,
          isArmed,
        ],
      );

      await client.query('COMMIT');
      return insertResult.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
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
