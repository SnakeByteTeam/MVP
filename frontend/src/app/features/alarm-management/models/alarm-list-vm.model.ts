import { ActiveAlarm } from '../../../core/alarm/models/active-alarm.model';

export interface AlarmListVm {
    alarms: ActiveAlarm[];
    currentPage: number;
    pageOffset: number;
    canGoPrevious: boolean;
    canGoNext: boolean;
    isResolving: boolean;
    resolvingId: string | null; //id dell'allarme in risoluzione, null se nessuna risoluzione in corso
    resolveError: string | null;
}
