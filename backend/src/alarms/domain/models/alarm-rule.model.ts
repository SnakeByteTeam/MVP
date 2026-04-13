import { AlarmPriority } from './alarm-priority.enum';

export class AlarmRule {
  constructor(
    private readonly id: string,
    private readonly position: string,
    private readonly name: string,
    private readonly thresholdOperator: string,
    private readonly thresholdValue: string,
    private readonly priority: AlarmPriority,
    private readonly armingTime: Date,
    private readonly dearmingTime: Date,
    private readonly isArmed: boolean,
  ) {}

  getId(): string{
    return this.id;
  }

  getPosition(): string{
    return this.position;
  }

  getName(): string {
    return this.name;
  }

  getThresholdOperator(): string {
    return this.thresholdOperator;
  }

  getThresholdValue(): string {
    return this.thresholdValue;
  }

  getPriority(): AlarmPriority {
    return this.priority;
  }

  getArmingTime(): Date {
    return this.armingTime
  }

  getDearmingTime(): Date {
    return this.dearmingTime;
  }

  getIsArmed(): boolean {
    return this.isArmed;
  }
}
