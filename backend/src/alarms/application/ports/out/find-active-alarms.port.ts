import { ActiveAlarm } from '../../../domain/models/active-alarm.model';

export const FIND_ALL_ACTIVE_ALARMS_PORT = 'FIND_ALL_ACTIVE_ALARMS_PORT';
export interface FindAllActiveAlarmsPort {
  findAllActive(): Promise<ActiveAlarm[]>;
}

export const FIND_ACTIVE_ALARM_BY_ID_PORT = 'FIND_ACTIVE_ALARM_BY_ID_PORT';
export interface FindActiveAlarmByIdPort {
  findById(id: string): Promise<ActiveAlarm | null>;
}

export const FIND_ACTIVE_ALARM_BY_RULE_ID_PORT = 'FIND_ACTIVE_ALARM_BY_RULE_ID_PORT';
export interface FindActiveAlarmByRuleIdPort {
  // Controlla se esiste già un allarme attivo (non risolto) per questa regola.
  // Questo è il controllo che evita duplicati quando il sensore continua
  // a mandare valori oltre soglia.
  findActiveByRuleId(alarmRuleId: string): Promise<ActiveAlarm | null>;
}

export const SAVE_ACTIVE_ALARM_PORT = 'SAVE_ACTIVE_ALARM_PORT';
export interface SaveActiveAlarmPort {
  save(alarm: ActiveAlarm): Promise<ActiveAlarm>;
}

export const RESOLVE_ACTIVE_ALARM_PORT = 'RESOLVE_ACTIVE_ALARM_PORT';
export interface ResolveActiveAlarmPort {
  resolve(id: string, resolvedAt: Date): Promise<void>;
}
