import { AlarmPriority } from './alarm-priority.enum';

export interface ActiveAlarm {
	id: string;
	alarmRuleId: string;
	deviceId?: string;
	alarmName: string;
	priority: AlarmPriority;
	activationTime: string;
	resolutionTime: string | null;
	position: string;
	userId: number | null;
	userUsername?: string | null;
}
