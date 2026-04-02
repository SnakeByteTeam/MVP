

export interface UpdateAlarmRuleRequestDto {
    priority: number;
    thresholdOperator: string;
    thresholdValue: string;
    armingTime: string;
    dearmingTime: string;
    isArmed: boolean;
}
