import { AlarmPriority } from '../../../domain/models/alarm-priority.enum';

export class CreateAlarmResDto {
  id!: string;
  name!: string;
  deviceId!: string;
  priority!: AlarmPriority;
  thresholdOperator!: string;
  thresholdValue!: string;
  activationTime!: string;
  deactivationTime!: string;
}
