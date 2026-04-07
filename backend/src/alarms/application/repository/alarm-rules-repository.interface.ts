import { AlarmPriority } from '../../domain/models/alarm-priority.enum';
import { AlarmRuleEntity } from '../../infrastructure/entities/alarm-rule-entity';
import { CheckAlarmEntity } from '../../infrastructure/entities/check-alarm-entity';

export interface AlarmRulesRepository {
  checkAlarmRule(
    datapointId: string,
    value: string,
    activationTime: string,
  ): Promise<CheckAlarmEntity | null>;

  createAlarmRule(
    name: string,
    priority: AlarmPriority,
    datapointId: string,
    deviceId: string,
    plantId: string,
    thresholdOperator: string,
    thresholdValue: string,
    armingTime: string,
    dearmingTime: string,
  ): Promise<AlarmRuleEntity>;

  deleteAlarmRule(id: string): Promise<void>;

  getAlarmRuleById(id: string): Promise<AlarmRuleEntity | null>;

  getAllAlarmRules(): Promise<AlarmRuleEntity[]>;

  updateAlarmRule(
    id: string,
    name: string,
    priority: AlarmPriority,
    thresholdOperator: string,
    thresholdValue: string,
    armingTime: string,
    dearmingTime: string,
    isArmed: boolean,
  ): Promise<AlarmRuleEntity>;
}

export const ALARM_RULES_REPOSITORY = 'ALARM_RULES_REPOSITORY';
