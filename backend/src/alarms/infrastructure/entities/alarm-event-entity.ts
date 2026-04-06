import { AlarmPriority } from '../../domain/models/alarm-priority.enum';

export class AlarmEventEntity {
  constructor(
    public readonly id: string,
    public readonly room_name: string,
    public readonly device_name: string,
    public readonly alarm_rule_id: string,
    public readonly alarm_name: string,
    public readonly priority: AlarmPriority,
    public readonly activation_time: Date,
    public readonly resolution_time: Date | null,
    public readonly user_id: number | null,
    public readonly user_username: string | null,
  ) {}
}
