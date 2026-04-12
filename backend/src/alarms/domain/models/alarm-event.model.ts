import { AlarmPriority } from './alarm-priority.enum';

export class AlarmEvent {
  constructor(
    private readonly id: string,
    private readonly position: string,
    private readonly alarmRuleId: string,
    private readonly alarmName: string,
    private readonly priority: AlarmPriority,
    private readonly activationTime: Date,
    private readonly resolutionTime: Date | null,
    private readonly userId: number | null,
    private readonly userUsername: string | null,
  ) {}

  getId(): string{
    return this.id;
  }

  getPosition(): string{
    return this.position;
  }

  getAlarmRuleId(): string{
    return this.alarmRuleId;
  }

  getAlarmName(): string{
    return this.alarmName;
  }

  getPriority(): AlarmPriority{
    return this.priority;
  }

  getActivationTime(): Date{
    return this.activationTime;
  }

  getResolutionTime(): Date | null{
    return this.resolutionTime;
  }

  getUserId(): number | null {
    return this.userId;
  }

  getUserUsername(): string | null {
    return this.userUsername;
  }
}
