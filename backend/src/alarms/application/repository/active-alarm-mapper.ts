import { ActiveAlarm } from '../../domain/models/active-alarm.model';
import { ActiveAlarmEntity } from '../../infrastructure/entities/alarm.entity';

/*
  Funzione di mapping per ActiveAlarm, Traduce una riga del DB nel domain model. scritto per non farlo ogni volta in ogni 
 */
export function toActiveModel(row: ActiveAlarmEntity): ActiveAlarm {
  return new ActiveAlarm(
    row.id,
    row.alarm_rule_id,
    row.alarm_name,
    row.danger_signal,
    row.triggered_at,
    row.resolved_at,
  );
}
