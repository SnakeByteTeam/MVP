import { AlarmPriority } from './alarm-priority.enum';

export class AlarmEvent {
  constructor(
    public readonly id: string,
    public readonly position: string,
    public readonly deviceId: string,
    public readonly alarmRuleId: string,
    public readonly alarmName: string,
    public readonly priority: AlarmPriority,
    public readonly activationTime: Date,
    public readonly resolutionTime: Date | null,
    public readonly userId: number | null,
    public readonly userUsername: string | null,
  ) { }
}
