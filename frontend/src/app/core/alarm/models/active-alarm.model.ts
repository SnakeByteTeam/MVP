import { AlarmPriority } from './alarm-priority.enum';

export interface ActiveAlarm {
	id: string;
	alarmRuleId: string;
	alarmName: string;
	priority: AlarmPriority;
	triggeredAt: string;
	resolvedAt: string | null;
	userId: string | null;
}
