import { DeleteAlarmRuleCmd } from '../../commands/delete-alarm-rule-cmd';

export interface DeleteAlarmRuleUseCase {
  deleteAlarmRule(req: DeleteAlarmRuleCmd): Promise<void>;
}

export const DELETE_ALARM_RULE_USE_CASE = 'DELETE_ALARM_RULE_USE_CASE';
