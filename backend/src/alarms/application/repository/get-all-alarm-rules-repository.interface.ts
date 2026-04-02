import { AlarmRuleEntity } from '../../infrastructure/entities/alarm-rule-entity';

export interface GetAllAlarmRulesRepository {
  getAllAlarmRules(): Promise<AlarmRuleEntity[]>;
}

export const GET_ALL_ALARM_RULES_REPOSITORY = 'GET_ALL_ALARM_RULES_REPOSITORY';
