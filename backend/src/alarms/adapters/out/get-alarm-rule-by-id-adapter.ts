import { Inject } from '@nestjs/common';
import { GetAlarmRuleByIdCmd } from '../../application/commands/get-alarm-rule-by-id-cmd';
import { GetAlarmRuleByIdPort } from '../../application/ports/out/get-alarm-rule-by-id.port';
import { AlarmRule } from '../../domain/models/alarm-rule.model';
import {
  GET_ALARM_RULE_BY_ID_REPOSITORY,
  GetAlarmRuleByIdRepository,
} from '../../application/repository/get-alarm-rule-by-id-repository.interface';

export class GetAlarmRuleByIdAdapter implements GetAlarmRuleByIdPort {
  constructor(
    @Inject(GET_ALARM_RULE_BY_ID_REPOSITORY)
    private readonly getAlarmRuleByIdRepository: GetAlarmRuleByIdRepository,
  ) {}

  async getAlarmRuleById(req: GetAlarmRuleByIdCmd): Promise<AlarmRule | null> {
    const alarmRule = await this.getAlarmRuleByIdRepository.getAlarmRuleById(
      req.id,
    );

    if (alarmRule == null) {
      return null;
    }

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
