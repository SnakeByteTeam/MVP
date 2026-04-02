import { AlarmPriority } from '../../domain/models/alarm-priority.enum';

export class UpdateAlarmRuleCmd {
  constructor(
    public readonly id: string,
    public readonly priority: AlarmPriority,
    public readonly thresholdOperator: string,
    public readonly thresholdValue: string,
    public readonly armingTime: string,
    public readonly dearmingTime: string,
    public readonly isArmed: boolean,
  ) { }
}
