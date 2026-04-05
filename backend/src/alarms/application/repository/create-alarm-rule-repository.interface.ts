import { AlarmPriority } from '../../domain/models/alarm-priority.enum';
import { AlarmRuleEntity } from '../../infrastructure/entities/alarm-rule-entity';

export interface CreateAlarmRuleRepository {
  createAlarmRule(
    name: string,
    priority: AlarmPriority,
    deviceId: string,
    thresholdOperator: string,
    thresholdValue: string,
    armingTime: string,
    dearmingTime: string,
  ): Promise<AlarmRuleEntity>;
}

export const CREATE_ALARM_RULE_REPOSITORY = 'CREATE_ALARM_RULE_REPOSITORY';
