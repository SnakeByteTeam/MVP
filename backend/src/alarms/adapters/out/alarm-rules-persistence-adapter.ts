import { Inject } from '@nestjs/common';
import { CreateAlarmRuleCmd } from '../../application/commands/create-alarm-rule.cmd';
import { DeleteAlarmRuleCmd } from '../../application/commands/delete-alarm-rule-cmd';
import { GetAlarmRuleByIdCmd } from '../../application/commands/get-alarm-rule-by-id-cmd';
import { UpdateAlarmRuleCmd } from '../../application/commands/update-alarm-rule.cmd';
import { CreateAlarmRulePort } from '../../application/ports/out/create-alarm-rule.port';
import { DeleteAlarmRulePort } from '../../application/ports/out/delete-alarm-rule.port';
import { GetAlarmRuleByIdPort } from '../../application/ports/out/get-alarm-rule-by-id.port';
import { GetAllAlarmRulesPort } from '../../application/ports/out/get-all-alarm-rules.port';
import { UpdateAlarmRulePort } from '../../application/ports/out/update-alarm-rule.port';
import { AlarmRule } from '../../domain/models/alarm-rule.model';
import {
  ALARM_RULES_REPOSITORY,
  AlarmRulesRepository,
} from '../../application/repository/alarm-rules-repository.interface';
import { CheckAlarmRuleCmd } from 'src/alarms/application/commands/check-alarm-rule-cmd';
import { CheckAlarm } from 'src/alarms/domain/models/check-alarm';
import { CheckAlarmEntity } from 'src/alarms/infrastructure/entities/check-alarm-entity';

export class AlarmRulesPersistenceAdapter
  implements
    CreateAlarmRulePort,
    DeleteAlarmRulePort,
    GetAlarmRuleByIdPort,
    GetAllAlarmRulesPort,
    UpdateAlarmRulePort
{
  constructor(
    @Inject(ALARM_RULES_REPOSITORY)
    private readonly alarmRulesRepository: AlarmRulesRepository,
  ) {}

  async createAlarmRule(cmd: CreateAlarmRuleCmd): Promise<AlarmRule> {
    const alarmRule = await this.alarmRulesRepository.createAlarmRule(
      cmd.name,
      cmd.priority,
      cmd.datapointId,
      cmd.deviceId,
      cmd.plantId,
      cmd.thresholdOperator,
      cmd.thresholdValue,
      cmd.armingTime,
      cmd.dearmingTime,
    );

    return new AlarmRule(
      alarmRule.id,
      alarmRule.plant_name +
        ' ' +
        alarmRule.room_name +
        ' ' +
        alarmRule.device_name,
      alarmRule.name,
      alarmRule.threshold_operator,
      alarmRule.threshold_value,
      alarmRule.priority,
      alarmRule.arming_time,
      alarmRule.dearming_time,
      alarmRule.is_armed,
    );
  }
  async deleteAlarmRule(req: DeleteAlarmRuleCmd): Promise<void> {
    return await this.alarmRulesRepository.deleteAlarmRule(req.id);
  }
  async getAlarmRuleById(req: GetAlarmRuleByIdCmd): Promise<AlarmRule | null> {
    const alarmRule = await this.alarmRulesRepository.getAlarmRuleById(req.id);

    if (alarmRule == null) {
      return null;
    }

    return new AlarmRule(
      alarmRule.id,
      alarmRule.plant_name +
        ' ' +
        alarmRule.room_name +
        ' ' +
        alarmRule.device_name,
      alarmRule.name,
      alarmRule.threshold_operator,
      alarmRule.threshold_value,
      alarmRule.priority,
      alarmRule.arming_time,
      alarmRule.dearming_time,
      alarmRule.is_armed,
    );
  }
  async getAllAlarmRules(): Promise<AlarmRule[]> {
    const alarmRules = await this.alarmRulesRepository.getAllAlarmRules();

    return alarmRules.map(
      (alarmRule) =>
        new AlarmRule(
          alarmRule.id,
          alarmRule.plant_name +
            ' ' +
            alarmRule.room_name +
            ' ' +
            alarmRule.device_name,
          alarmRule.name,
          alarmRule.threshold_operator,
          alarmRule.threshold_value,
          alarmRule.priority,
          alarmRule.arming_time,
          alarmRule.dearming_time,
          alarmRule.is_armed,
        ),
    );
  }
  async updateAlarmRule(req: UpdateAlarmRuleCmd): Promise<AlarmRule> {
    const alarmRule = await this.alarmRulesRepository.updateAlarmRule(
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
      alarmRule.plant_name +
        ' ' +
        alarmRule.room_name +
        ' ' +
        alarmRule.device_name,
      alarmRule.name,
      alarmRule.threshold_operator,
      alarmRule.threshold_value,
      alarmRule.priority,
      alarmRule.arming_time,
      alarmRule.dearming_time,
      alarmRule.is_armed,
    );
  }

  async checkAlarmRule(req: CheckAlarmRuleCmd): Promise<CheckAlarm| null> {
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

    const alarmRule = await this.alarmRulesRepository.checkAlarmRule(
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
