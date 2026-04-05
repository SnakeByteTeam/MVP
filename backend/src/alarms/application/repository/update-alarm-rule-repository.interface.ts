import { AlarmPriority } from '../../domain/models/alarm-priority.enum';
import { AlarmRuleEntity } from '../../infrastructure/entities/alarm-rule-entity';

export interface UpdateAlarmRuleRepository {
  updateAlarmRule(
    id: string,
    name: string,
    priority: AlarmPriority,
    thresholdOperator: string,
    thresholdValue: string,
    armingTime: string,
    dearmingTime: string,
    isArmed: boolean,
  ): Promise<AlarmRuleEntity>;
}

export const UPDATE_ALARM_RULE_REPOSITORY = 'UPDATE_ALARM_RULE_REPOSITORY';
