

export interface UpdateAlarmRuleRequestDto {
    priority: number;
    thresholdOperator: string;
    thresholdValue: string;
    activationTime: string;
    deactivationTime: string;
    isArmed: boolean;
}
