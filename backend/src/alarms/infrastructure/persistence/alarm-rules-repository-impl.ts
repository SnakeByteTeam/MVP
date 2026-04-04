import { Inject } from '@nestjs/common';
import { PG_POOL } from '../../../database/database.module';
import { v4 as uuidv4 } from 'uuid';
import { DeleteAlarmRepository } from '../../application/repository/delete-alarm-repository.interface';
import { GetAlarmRuleRepository } from '../../application/repository/get-alarm-repository.interface';
import { GetAllAlarmRulesRepository } from '../../application/repository/get-all-alarm-rules-repository.interface';
import { AlarmPriority } from '../../domain/models/alarm-priority.enum';
import { AlarmRuleEntity } from '../entities/alarm-rule-entity';
import { CreateAlarmRuleRepository } from '../../application/repository/create-alarm-rule-repository.interface';
import { UpdateAlarmRuleRepository } from '../../application/repository/update-alarm-rule-repository.interface';

export class AlarmRulesRepositoryImpl
  implements
    CreateAlarmRuleRepository,
    GetAlarmRuleRepository,
    GetAllAlarmRulesRepository,
    DeleteAlarmRepository,
    UpdateAlarmRuleRepository
{
  constructor(@Inject(PG_POOL) private readonly pool) {}

  async createAlarmRule(
    name: string,
    priority: AlarmPriority,
    deviceId: string,
    thresholdOperator: string,
    thresholdValue: string,
    armingTime: string,
    dearmingTime: string,
  ): Promise<AlarmRuleEntity> {
    const rows = await this.pool.query(
      `INSERT INTO alarms_rule (id, name, threshold_operator, threshold_value, priority, 
       arming_time, dearming_time, is_armed, device_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        uuidv4(),
        name,
        thresholdOperator,
        thresholdValue,
        priority,
        armingTime,
        dearmingTime,
        true,
        deviceId
      ],
    );
    return rows[0];
  }

  async getAlarmRule(id: string): Promise<AlarmRuleEntity | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM alarms_rule WHERE id = $1',
      [id],
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async getAllAlarmRules(): Promise<AlarmRuleEntity[]> {
    const { rows } = await this.pool.query(
      'SELECT * FROM alarms_rule ORDER BY created_at DESC',
    );
    return rows;
  }

  async deleteAlarmRule(id: string): Promise<void> {
    await this.pool.query('DELETE FROM alarms WHERE id = $1', [id]);
  }

  async updateAlarmRule(
    id: string,
    priority: AlarmPriority,
    thresholdOperator: string,
    thresholdValue: string,
    armingTime: string,
    dearmingTime: string,
    isArmed: boolean,
  ): Promise<AlarmRuleEntity> {
    const rows = await this.pool.query(
      `UPDATE alarms SET
        priority          = COALESCE($2, priority),
        threshold         = COALESCE($3, threshold),
        activation_time   = COALESCE($4, activation_time),
        deactivation_time = COALESCE($5, deactivation_time),
        enabled           = COALESCE($6, enabled),
        updated_at        = NOW()
        WHERE id = $1
        RETURNING *`,
      [id, priority, thresholdOperator, thresholdValue, armingTime, dearmingTime, isArmed],
    );
    return rows[0];
  }
}
