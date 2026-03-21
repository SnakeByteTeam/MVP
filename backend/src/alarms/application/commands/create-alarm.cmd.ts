import { AlarmPriority } from '../../domain/models/alarm-priority.enum';

export class CreateAlarmCmd {
  constructor(
    public readonly name: string,
    public readonly plantId: string,
    public readonly deviceId: string,
    public readonly priority: AlarmPriority,
    public readonly threshold: number,
    public readonly activationTime: string,
    public readonly deactivationTime: string,
  ) {}
}
