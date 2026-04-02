import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';

export type AlarmConfigTableRow = {
    readonly id: string;
    readonly name: string;
    readonly apartment: string;
    readonly device: string;
    readonly priority: AlarmPriority;
    readonly threshold: string;
    readonly armingTime: string;
    readonly dearmingTime: string;
    readonly isEnabled: boolean;
};
