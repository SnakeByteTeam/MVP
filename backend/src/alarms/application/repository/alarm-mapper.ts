import { Alarm } from '../../domain/models/alarm.model';
import { AlarmPriority } from '../../domain/models/alarm-priority.enum';
import { AlarmEntity } from '../../infrastructure/entities/alarm.entity';

/*
  Funzione di mapping condivisa tra tutti i repository. anche qui scritto per non riscriverlo ogni volta
*/
export function toModel(row: AlarmEntity): Alarm {
  return new Alarm(
    row.id,
    row.name,
    row.plant_id,
    row.device_id,
    row.priority as AlarmPriority,
    row.threshold,
    row.activation_time,
    row.deactivation_time,
    row.enabled,
    row.created_at,
    row.updated_at,
  );
}
