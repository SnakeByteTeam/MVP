import { Inject } from '@nestjs/common';
import { UpdateAlarmRuleCmd } from '../../application/commands/update-alarm-rule.cmd';
import { AlarmRule } from '../../domain/models/alarm-rule.model';
import {
  UPDATE_ALARM_RULE_REPOSITORY,
  UpdateAlarmRuleRepository,
} from '../../application/repository/update-alarm-rule-repository.interface';

export class UpdateAlarmRuleAdapter {
  constructor(
    @Inject(UPDATE_ALARM_RULE_REPOSITORY)
    private readonly updateAlarmRuleRepository: UpdateAlarmRuleRepository,
  ) { }

  async updateAlarmRule(req: UpdateAlarmRuleCmd): Promise<AlarmRule> {
    const alarmRule = await this.updateAlarmRuleRepository.updateAlarmRule(
      req.id,
      req.name,
      req.priority,
      req.thresholdOperator,
      req.thresholdValue,
      req.armingTime,
      req.dearmingTime,
      req.isArmed,
    );
    return new AlarmRule(
      alarmRule.id,
      "",
      alarmRule.name,
      alarmRule.threshold_operator,
      alarmRule.threshold_value,
      alarmRule.priority,
      alarmRule.arming_time,
      alarmRule.dearming_time,
      alarmRule.is_armed,
      alarmRule.device_id,
    );
  }
}
