export class ActiveAlarmEntity {
  constructor(
    public id: string,
    public alarm_rule_id: string,
    public alarm_name: string,
    public danger_signal: string,
    public triggered_at: Date,
    public resolved_at: Date | null,
  ) {}
}
