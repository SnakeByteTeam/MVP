

export interface CreateAlarmRuleRequestDto {
    name: string;
    deviceId: string;
    plantId: string;
    priority: number;
    thresholdOperator: string;
    thresholdValue: string;
    armingTime: string;
    dearmingTime: string;
}



