import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';

export type ActiveAlarmTableRow = {
    readonly id: string;
    readonly priority: AlarmPriority;
    readonly name: string;
    readonly device: string;
    readonly location: string;
    readonly status: string;
    readonly openedAt: string;
    readonly isManaged: boolean;
    readonly isResolving: boolean;
    readonly isActionDisabled: boolean;
    readonly actionLabel: string;
    readonly actionAriaLabel: string;
};
