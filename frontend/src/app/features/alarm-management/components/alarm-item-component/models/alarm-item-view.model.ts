import { AlarmPriority } from '../../../../../core/alarm/models/alarm-priority.enum';

export type AlarmItemPriorityUi = {
    readonly label: string;
    readonly borderClass: string;
    readonly badgeClass: string;
    readonly dotClass: string;
    readonly iconClass: string;
};

export type AlarmItemPriorityUiMap = Readonly<Record<AlarmPriority, AlarmItemPriorityUi>>;

export type AlarmItemViewModel = {
    readonly id: string;
    readonly alarmName: string;
    readonly alarmRuleId: string;
    readonly activationTime: string;
    readonly isResolving: boolean;
    readonly priorityLabel: string;
    readonly cardClass: string;
    readonly priorityBadgeClass: string;
    readonly priorityDotClass: string;
    readonly priorityIconClass: string;
    readonly articleAriaLabel: string;
    readonly resolveButtonAriaLabel: string;
    readonly resolveButtonText: string;
    readonly resolvingStatusText: string;
    readonly waitingStatusText: string;
};