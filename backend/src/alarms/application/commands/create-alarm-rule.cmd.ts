import { AlarmPriority } from '../../domain/models/alarm-priority.enum';

export class CreateAlarmRuleCmd {
  constructor(
    public readonly name: string,
    public readonly deviceId: string,
    public readonly priority: AlarmPriority,
    public readonly thresholdOperator: string,
    public readonly thresholdValue: string,
    public readonly activationTime: string,
    public readonly deactivationTime: string,
  ) {}
}
