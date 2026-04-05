import { AlarmRule } from '../../../domain/models/alarm-rule.model';

export interface GetAllAlarmRulesPort {
  getAllAlarmRules(): Promise<AlarmRule[]>;
}

export const GET_ALL_ALARM_RULES_PORT = 'GET_ALL_ALARM_RULES_PORT';
