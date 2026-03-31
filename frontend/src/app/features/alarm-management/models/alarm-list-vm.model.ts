import { ActiveAlarm } from '../../../core/alarm/models/active-alarm.model';

export type AlarmScope = 'all' | 'mine';

export interface AlarmListVm {
    alarms: ActiveAlarm[];
    isResolving: boolean;
    resolvingId: string | null; //id dell'allarme in risoluzione, null se nessuna risoluzione in corso
    resolveError: string | null;
    activeScope: AlarmScope;
    availableScopes: AlarmScope[];
    scopeInfoMessage: string | null;
    scopeLoading: boolean;
}
