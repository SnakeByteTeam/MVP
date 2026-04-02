import { AlarmPriority } from './alarm-priority.enum';

export interface AlarmRule {
  id: string;
  name: string;
  thresholdOperator: string;
  thresholdValue: string;
  priority: AlarmPriority;
  armingTime: Date | string;
  dearmingTime: Date | string;
  isArmed: boolean;
  deviceId: string;
}
