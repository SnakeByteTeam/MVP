import { AlarmRuleEntity } from '../../infrastructure/entities/alarm-rule-entity';

export interface GetAlarmRuleRepository {
  getAlarmRule(id: string): Promise<AlarmRuleEntity | null>;
}

export const GET_ALARM_RULE_REPOSITORY = 'GET_ALARM_RULE_REPOSITORY';
