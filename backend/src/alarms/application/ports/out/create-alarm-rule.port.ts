import { AlarmRule } from '../../../domain/models/alarm-rule.model';
import { CreateAlarmRuleCmd } from '../../commands/create-alarm-rule.cmd';

export interface CreateAlarmRulePort {
  createAlarmRule(cmd: CreateAlarmRuleCmd): Promise<AlarmRule>;
}

export const CREATE_ALARM_RULE_PORT = 'CREATE_ALARM_RULE_PORT';
