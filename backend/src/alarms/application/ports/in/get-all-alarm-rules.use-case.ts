import { AlarmRule } from '../../../domain/models/alarm-rule.model';

export interface GetAllAlarmRulesUseCase {
  getAllAlarmRules(): Promise<AlarmRule[]>;
}

export const GET_ALL_ALARM_RULES_USE_CASE = 'GET_ALL_ALARM_RULES_USE_CASE';
