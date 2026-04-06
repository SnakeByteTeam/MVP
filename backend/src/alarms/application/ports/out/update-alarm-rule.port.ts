import { AlarmRule } from '../../../domain/models/alarm-rule.model';
import { UpdateAlarmRuleCmd } from '../../commands/update-alarm-rule.cmd';

export interface UpdateAlarmRulePort {
  updateAlarmRule(cmd: UpdateAlarmRuleCmd): Promise<AlarmRule>;
}

export const UPDATE_ALARM_RULE_PORT = 'UPDATE_ALARM_RULE_PORT';
