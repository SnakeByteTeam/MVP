import { AlarmPriority } from '../../domain/models/alarm-priority.enum';

export class CreateAlarmRuleCmd {
  constructor(
    public readonly name: string,
    public readonly datapointId: string,
    public readonly deviceId: string,
    public readonly plantId: string,
    public readonly priority: AlarmPriority,
    public readonly thresholdOperator: string,
    public readonly thresholdValue: string,
    public readonly armingTime: string,
    public readonly dearmingTime: string,
  ) { }
}
