import { AlarmPriority } from '../../domain/models/alarm-priority.enum';

export class AlarmRuleEntity {
  constructor(
    public readonly id: string,
    public readonly plant_name: string,
    public readonly room_name: string,
    public readonly device_name: string,
    public readonly name: string,
    public readonly threshold_operator: string,
    public readonly threshold_value: string,
    public readonly priority: AlarmPriority,
    public readonly arming_time: Date,
    public readonly dearming_time: Date,
    public readonly is_armed: boolean,
    public readonly device_id: string,
  ) {}
}
