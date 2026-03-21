import { AlarmPriority } from '../../domain/models/alarm-priority.enum';

export class UpdateAlarmCmd {
  constructor(
    public readonly id: string,
    public readonly priority?: AlarmPriority,
    public readonly threshold?: number,
    public readonly activationTime?: string,
    public readonly deactivationTime?: string,
    public readonly enabled?: boolean,
  ) {}
}
