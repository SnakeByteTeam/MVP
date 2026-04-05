

export interface CreateAlarmRuleRequestDto {
    name: string;
    deviceId: string;
    priority: number;
    thresholdOperator: string;
    thresholdValue: string;
    armingTime: string;
    dearmingTime: string;
}



