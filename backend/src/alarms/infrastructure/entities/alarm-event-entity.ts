import { AlarmPriority } from '../../domain/models/alarm-priority.enum';

export class AlarmEventEntity {
  constructor(
    public id: string,
    public alarm_rule_id: string,
    public alarm_name: string,
    public readonly priority: AlarmPriority,
    public activation_time: Date,
    public resolution_time: Date | null,
    public user_id: number | null,
  ) {}
}
