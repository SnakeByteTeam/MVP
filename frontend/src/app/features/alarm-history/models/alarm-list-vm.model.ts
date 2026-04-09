import { ActiveAlarm } from '../../../core/alarm/models/active-alarm.model';

export interface AlarmListVm {
    alarms: ActiveAlarm[];
    currentPage: number;
    pageLimit: number;
    pageOffset: number;
    canGoPrevious: boolean;
    canGoNext: boolean;
}