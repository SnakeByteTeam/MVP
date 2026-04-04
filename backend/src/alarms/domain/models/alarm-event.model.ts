export class AlarmEvent {
  constructor(
    public readonly id: string,
    public readonly alarmId: string,
    public readonly alarmName: string,
    public readonly dangerSignal: string,
    public readonly triggeredAt: Date,
    public readonly resolvedAt: Date | null,
  ) {}
}
