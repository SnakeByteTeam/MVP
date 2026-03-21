import { AlarmPriority } from '../../domain/models/alarm-priority.enum';
import { Alarm } from '../../domain/models/alarm.model';

export class AlarmDto {
  id: string;
  name: string;
  plantId: string;
  deviceId: string;
  priority: AlarmPriority;
  threshold: number;
  activationTime: string;
  deactivationTime: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(alarm: Alarm): AlarmDto {
    const dto = new AlarmDto();
    dto.id = alarm.id;
    dto.name = alarm.name;
    dto.plantId = alarm.plantId;
    dto.deviceId = alarm.deviceId;
    dto.priority = alarm.priority;
    dto.threshold = alarm.threshold;
    dto.activationTime = alarm.activationTime;
    dto.deactivationTime = alarm.deactivationTime;
    dto.enabled = alarm.enabled;
    dto.createdAt = alarm.createdAt;
    dto.updatedAt = alarm.updatedAt;
    return dto;
  }
}
