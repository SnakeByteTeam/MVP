import { Inject } from '@nestjs/common';
import { CheckAlarmRuleCmd } from '../../application/commands/check-alarm-rule-cmd';
import { CheckAlarmRulePort } from '../../application/ports/out/check-alarm-rule-port.interface';
import {
  CHECK_ALARM_RULE_REPOSITORY,
  CheckAlarmRuleRepository,
} from '../../application/repository/check-alarm-rule-repository.interface';
import { CheckAlarm } from '../../domain/models/check-alarm';
import { CheckAlarmEntity } from 'src/alarms/infrastructure/entities/check-alarm-entity';

export class CheckAlarmRuleAdapter implements CheckAlarmRulePort {
  constructor(
    @Inject(CHECK_ALARM_RULE_REPOSITORY)
    private readonly checkAlarmRuleRepository: CheckAlarmRuleRepository,
  ) {}

  async checkAlarmRule(req: CheckAlarmRuleCmd): Promise<CheckAlarm | null> {
    const hours: string = req.activationTime
      .getUTCHours()
      .toString()
      .padStart(2, '0');

    const minutes: string = req.activationTime
      .getUTCMinutes()
      .toString()
      .padStart(2, '0');

    const time: string = `${hours}:${minutes}`;

    const value = this.normalizeValue(req.value);

    const alarmRule = await this.checkAlarmRuleRepository.checkAlarmRule(
      req.deviceId,
      value,
      time,
    );

    if (alarmRule == null) {
      return null;
    }

    return CheckAlarmEntity.toDomain(alarmRule);
  }

  private normalizeValue(value: string): string {
    const normalizedValue = value.trim();

    if (normalizedValue.toLowerCase() === 'true') {
      return 'on';
    }

    if (normalizedValue.toLowerCase() === 'false') {
      return 'off';
    }

    return normalizedValue;
  }
}
