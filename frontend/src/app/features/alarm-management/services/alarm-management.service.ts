import { Injectable, inject } from '@angular/core';
import {
    BehaviorSubject,
    EMPTY,
    Observable,
    catchError,
    combineLatest,
    finalize,
    map,
    shareReplay,
    switchMap,
    take,
    tap,
} from 'rxjs';
import { ActiveAlarm } from '../../../core/alarm/models/active-alarm.model';
import { AlarmApiService } from '../../../core/alarm/services/alarm-api.service';
import { AlarmStateService } from '../../../core/alarm/services/alarm-state.service';
import { UserRole } from '../../../core/models/user-role.enum';
import { InternalAuthService } from '../../../core/services/internal-auth.service';
import { UserSession } from '../../user-auth/models/user-session.model';
import { AlarmListVm } from '../models/alarm-list-vm.model';

@Injectable({ providedIn: 'root' })
export class AlarmManagementService {
    private readonly alarmStateService = inject(AlarmStateService);
    private readonly alarmApiService = inject(AlarmApiService);
    private readonly authService = inject(InternalAuthService);

    private readonly resolvingId$ = new BehaviorSubject<string | null>(null);
    private readonly resolveError$ = new BehaviorSubject<string | null>(null);
    private pendingResolveRequests = 0;

    public readonly vm$ = combineLatest([
        this.alarmStateService.getActiveAlarms$(),
        this.authService.getCurrentUser$(),
        this.resolvingId$.asObservable(),
        this.resolveError$.asObservable(),
    ]).pipe(
        map(([alarms, session, resolvingId, resolveError]): AlarmListVm => ({
            alarms: this.filterAlarmsBySession(alarms, session),
            isResolving: this.pendingResolveRequests > 0,
            resolvingId,
            resolveError,
        })),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    public initialize(): void {
        this.getInitialActiveAlarms$()
            .pipe(
                take(1),
                tap((alarms) => {
                    this.alarmStateService.setActiveAlarms(alarms);
                }),
                catchError((error: unknown) => {
                    this.resolveError$.next(this.mapResolveError(error));
                    return EMPTY;
                })
            )
            .subscribe();
    }

    public resolveAlarm(activeAlarmId: string): void {
        this.pendingResolveRequests += 1;
        this.resolvingId$.next(activeAlarmId);
        this.resolveError$.next(null);

        this.authService
            .getCurrentUser$()
            .pipe(
                take(1),
                switchMap((session) => {
                    const numericUserId = Number(session?.userId);
                    if (!Number.isInteger(numericUserId)) {
                        throw new TypeError('Utente corrente non valido per risolvere l\'allarme.');
                    }

                    return this.alarmApiService.resolveAlarm(activeAlarmId, numericUserId);
                }),
                tap(() => {
                    this.alarmStateService.onAlarmResolved(activeAlarmId);
                }),
                catchError((error: unknown) => {
                    this.resolveError$.next(this.mapResolveError(error));
                    return EMPTY;
                }),
                finalize(() => {
                    this.pendingResolveRequests = Math.max(0, this.pendingResolveRequests - 1);
                    if (this.pendingResolveRequests === 0) {
                        this.resolvingId$.next(null);
                    }
                })
            )
            .subscribe();
    }

    //oss solo i suoi (reparti assegnati), admin tutti
    private getInitialActiveAlarms$(): Observable<ActiveAlarm[]> {
        return this.authService.getCurrentUser$().pipe(
            take(1),
            switchMap((session) => {
                return this.alarmApiService.getActiveAlarms().pipe(
                    map((alarms) => this.filterAlarmsBySession(alarms, session))
                );
            })
        );
    }

    private filterAlarmsBySession(alarms: ActiveAlarm[], session: UserSession | null): ActiveAlarm[] {
        if (session?.role !== UserRole.OPERATORE_SANITARIO) {
            return alarms;
        }

        const numericUserId = Number(session.userId);
        if (!Number.isInteger(numericUserId)) {
            return [];
        }

        return alarms.filter((alarm) => alarm.userId === numericUserId);
    }

    private mapResolveError(error: unknown): string {
        if (error instanceof Error && error.message.trim().length > 0) {
            return error.message;
        }

        if (
            typeof error === 'object' &&
            error !== null &&
            'message' in error &&
            typeof error.message === 'string' &&
            error.message.trim().length > 0
        ) {
            return error.message;
        }

        return 'Errore durante la risoluzione dell\'allarme.';
    }
}
