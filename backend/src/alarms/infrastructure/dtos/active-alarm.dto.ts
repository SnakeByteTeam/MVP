import { ActiveAlarm } from '../../domain/models/active-alarm.model';

export class ActiveAlarmDto {
  id: string;
  alarmRuleId: string;
  alarmName: string;
  dangerSignal: string;
  triggeredAt: string; 
  resolvedAt: string | null;

  static fromDomain(alarm: ActiveAlarm): ActiveAlarmDto {
    const dto = new ActiveAlarmDto();
    dto.id = alarm.id;
    dto.alarmRuleId = alarm.alarmRuleId;
    dto.alarmName = alarm.alarmName;
    dto.dangerSignal = alarm.dangerSignal;
    dto.triggeredAt = alarm.triggeredAt.toISOString();
    dto.resolvedAt = alarm.resolvedAt ? alarm.resolvedAt.toISOString() : null;
    return dto;
  }
}
