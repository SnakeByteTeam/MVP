import { AlarmPriority } from './alarm-priority.enum';

export interface AlarmEvent {
	activeAlarmId: string;
	alarmRuleId: string;
	alarmName: string;
	priority: AlarmPriority;
	triggeredAt: string;
}
