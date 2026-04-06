

export interface UpdateAlarmRuleRequestDto {
    name: string;
    priority: number;
    thresholdOperator: string;
    thresholdValue: string;
    armingTime: string;
    dearmingTime: string;
    isArmed: boolean;
}
