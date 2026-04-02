

export interface CreateAlarmRuleRequestDto {
    name: string;
    deviceId: string;
    priority: number;
    thresholdOperator: string;
    thresholdValue: string;
    activationTime: string;
    deactivationTime: string;
}



