import { AlarmPriority } from './alarm-priority.enum';

export class AlarmRule {
  constructor(
    public readonly id: string,
    public readonly position: string,
    public readonly name: string,
    public readonly thresholdOperator: string,
    public readonly thresholdValue: string,
    public readonly priority: AlarmPriority,
    public readonly armingTime: Date,
    public readonly dearmingTime: Date,
    public readonly isArmed: boolean,
  ) {}
}
