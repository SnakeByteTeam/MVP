import { AlarmPriority } from '../alarm-priority.enum';

export interface GetActiveAlarmsByUserResponseDto {
    id: string;
    alarmRuleId: string;
    alarmName: string;
    priority: AlarmPriority;
    activationTime: string;
    resolutionTime: string | null;
    position: string;
}
