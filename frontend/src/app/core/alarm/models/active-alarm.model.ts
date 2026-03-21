import { AlarmStatus } from "./alarm-status.enum";

export interface ActiveAlarm {
	alarmId: string;
	alarmName: string;
	activationTime: string;
	resolutionTime: string;
	status: AlarmStatus;
	// elapsedTime: number; non serve perchè calcolato dalla pipe 
}
