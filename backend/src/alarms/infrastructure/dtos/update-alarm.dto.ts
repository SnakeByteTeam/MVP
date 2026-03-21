import { AlarmPriority } from '../../domain/models/alarm-priority.enum';

export class UpdateAlarmDto {
  priority?: AlarmPriority;
  threshold?: number;
  activationTime?: string;
  deactivationTime?: string;
  enabled?: boolean;
}
