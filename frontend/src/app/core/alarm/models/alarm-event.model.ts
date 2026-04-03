import { AlarmPriority } from './alarm-priority.enum';

export interface AlarmEvent {
	activeAlarmId: string;
	alarmRuleId: string;
	alarmName: string;
	priority: AlarmPriority;
	triggeredAt: string;
	resolvedAt: string | null;
	user_id: string | null;
}
