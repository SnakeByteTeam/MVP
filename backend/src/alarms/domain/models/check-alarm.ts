export class CheckAlarm {
  constructor(
    public readonly alarm_rule_id: string,
    public readonly ward_id: number,
    public readonly alarm_event_id?: string,
  ) {}
}
