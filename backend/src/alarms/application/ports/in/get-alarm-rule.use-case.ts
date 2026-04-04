import { AlarmRule } from '../../../domain/models/alarm-rule.model';
import { GetAlarmRuleByIdCmd } from '../../commands/get-alarm-rule-by-id-cmd';

export interface GetAlarmRuleUseCase {
  getAlarmRule(req: GetAlarmRuleByIdCmd): Promise<AlarmRule | null>;
}

export const GET_ALARM_RULE_USE_CASE = 'GET_ALARM_RULE_USE_CASE';
