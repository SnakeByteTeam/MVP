export class CheckAlarmEntity {
  constructor(
    public readonly alarm_rule_id: string,
    public readonly ward_id: number | null,
    public readonly alarm_event_id?: string | null,
  ) {}
}