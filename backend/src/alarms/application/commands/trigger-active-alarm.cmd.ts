export class TriggerActiveAlarmCmd {
  constructor(
    public readonly alarmId: string,
    public readonly alarmName: string,
    public readonly dangerSignal: string,
  ) {}
}
