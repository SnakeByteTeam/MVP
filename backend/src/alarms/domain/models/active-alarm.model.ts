// ActiveAlarm rappresenta un allarme che scatta.
export class ActiveAlarm {
  constructor(
    public readonly id: string,
    public readonly alarmRuleId: string,  // riferimento alla regola che ha scattato
    public readonly alarmName: string,    // nome copiato dalla regola al momento dello scatto
    public readonly dangerSignal: string, // descrizione del segnale di pericolo 
    public readonly triggeredAt: Date,
    public readonly resolvedAt: Date | null, // null = ancora attivo
  ) {}

  get isActive(): boolean {
    return this.resolvedAt === null;
  }
}
