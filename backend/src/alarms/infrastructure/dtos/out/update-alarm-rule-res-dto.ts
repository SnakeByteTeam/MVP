import { AlarmPriority } from '../../../domain/models/alarm-priority.enum';

export class UpdateAlarmRuleResDto {
  id!: string;
  name!: string;
  thresholdOperator!: string;
  thresholdValue!: string;
  priority!: AlarmPriority;
  armingTime!: Date;
  dearmingTime!: Date;
  isArmed!: boolean;
  deviceId!: string;
}