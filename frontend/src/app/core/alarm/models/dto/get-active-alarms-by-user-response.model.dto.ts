import { AlarmPriority } from '../alarm-priority.enum';

export interface GetActiveAlarmsByUserResponseDto {
    id: string;
    alarmRuleId: string;
    deviceId: string;
    alarmName: string;
    priority: AlarmPriority;
    activationTime: string;
    resolutionTime: string | null;
    position: string;
    userUsername: string | null;
}
