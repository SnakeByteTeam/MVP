import { AlarmPriority } from './alarm-priority.enum';

export interface ActiveAlarm {
	id: string;
	alarmRuleId: string;
	alarmName: string;
	priority: AlarmPriority;
	activationTime: string;
	resolutionTime: string | null;
}
