import { Inject } from '@nestjs/common';
import { GetAllAlarmRulesPort } from '../../application/ports/out/get-all-alarm-rules.port';
import { AlarmRule } from '../../domain/models/alarm-rule.model';
import {
  GET_ALL_ALARM_RULES_REPOSITORY,
  GetAllAlarmRulesRepository,
} from '../../application/repository/get-all-alarm-rules-repository.interface';

export class GetAllAlarmRulesAdapter implements GetAllAlarmRulesPort {
  constructor(
    @Inject(GET_ALL_ALARM_RULES_REPOSITORY)
    private readonly getAllAlarmRulesRepository: GetAllAlarmRulesRepository,
  ) {}

  async getAllAlarmRules(): Promise<AlarmRule[]> {
    const alarmRules = await this.getAllAlarmRulesRepository.getAllAlarmRules();

    return alarmRules.map(
      (alarmRule) =>
        new AlarmRule(
          alarmRule.id,
          alarmRule.plant_name + ' ' + alarmRule.room_name + ' ' + alarmRule.device_name,
          alarmRule.name,
          alarmRule.threshold_operator,
          alarmRule.threshold_value,
          alarmRule.priority,
          alarmRule.arming_time,
          alarmRule.dearming_time,
          alarmRule.is_armed,
          alarmRule.device_id,
        ),
    );
  }
}
