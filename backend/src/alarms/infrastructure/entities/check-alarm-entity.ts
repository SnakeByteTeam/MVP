import { CheckAlarm } from 'src/alarms/domain/models/check-alarm';

export class CheckAlarmEntity {
  constructor(
    public readonly alarm_rule_id: string,
    public readonly ward_id: number | null,
    public readonly alarm_event_id?: string | null,
  ) {}

  static toDomain(entity: CheckAlarmEntity): CheckAlarm | null {
    if (entity.ward_id == null) {
      return null;
    }

    return new CheckAlarm(
      entity.alarm_rule_id,
      entity.ward_id,
      entity.alarm_event_id ?? undefined,
    );
  }
}
