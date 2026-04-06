import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';

export type AlarmTableRow = {
    readonly id: string;
    readonly priority: AlarmPriority;
    readonly name: string;
    readonly device: string;
    readonly location: string;
    readonly status: string;
    readonly openedAt: string;
    readonly closedAt: string;
    readonly handlerUsername: string;
};