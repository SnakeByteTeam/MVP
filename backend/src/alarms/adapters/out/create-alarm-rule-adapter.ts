import { Inject } from '@nestjs/common';
import { CreateAlarmRuleCmd } from '../../application/commands/create-alarm-rule.cmd';
import { CreateAlarmRulePort } from '../../application/ports/out/create-alarm-rule.port';
import { AlarmRule } from '../../domain/models/alarm-rule.model';
import {
  CREATE_ALARM_RULE_REPOSITORY,
  CreateAlarmRuleRepository,
} from '../../application/repository/create-alarm-rule-repository.interface';

export class CreateAlarmRuleAdapter implements CreateAlarmRulePort {
  constructor(
    @Inject(CREATE_ALARM_RULE_REPOSITORY)
    private readonly createAlarmRuleRepository: CreateAlarmRuleRepository,
  ) {}

  async createAlarmRule(cmd: CreateAlarmRuleCmd): Promise<AlarmRule> {
    const alarmRule = await this.createAlarmRuleRepository.createAlarmRule(
      cmd.name,
      cmd.priority,
      cmd.deviceId,
      cmd.plantId,
      cmd.thresholdOperator,
      cmd.thresholdValue,
      cmd.armingTime,
      cmd.dearmingTime,
    );

    return new AlarmRule(
      alarmRule.id,
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
