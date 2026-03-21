import { AlarmPriority } from '../../domain/models/alarm-priority.enum';

export class CreateAlarmDto {
  name: string;
  plantId: string;
  deviceId: string;
  priority: AlarmPriority;
  threshold: number;
  activationTime: string;
  deactivationTime: string;
}
