import { DeleteAlarmRuleCmd } from '../../commands/delete-alarm-rule-cmd';

export interface DeleteAlarmRulePort {
  deleteAlarmRule(req: DeleteAlarmRuleCmd): Promise<void>;
}

export const DELETE_ALARM_RULE_PORT = 'DELETE_ALARM_RULE_PORT';
