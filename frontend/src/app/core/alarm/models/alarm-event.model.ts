import { AlarmPriority } from './alarm-priority.enum';

export interface AlarmEvent {
	id: string;
	alarmRuleId: string;
	alarmName: string;
	priority: AlarmPriority;
	activationTime: string;
	resolutionTime: string | null;
}
