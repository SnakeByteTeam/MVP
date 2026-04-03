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
    private readonly pageLimit = 6;

    private readonly locallyManagedAlarms$ = new BehaviorSubject<ActiveAlarm[]>([]);
    private readonly resolvingId$ = new BehaviorSubject<string | null>(null);
    private readonly resolveError$ = new BehaviorSubject<string | null>(null);
    private readonly pageOffset$ = new BehaviorSubject<number>(0);
    private readonly canGoNext$ = new BehaviorSubject<boolean>(false);
    private pendingResolveRequests = 0;

    public readonly vm$ = combineLatest([
        this.alarmStateService.getActiveAlarms$(),
        this.locallyManagedAlarms$.asObservable(),
        this.authService.getCurrentUser$(),
        this.resolvingId$.asObservable(),
        this.resolveError$.asObservable(),
        this.pageOffset$.asObservable(),
        this.canGoNext$.asObservable(),
    ]).pipe(
        map(([alarms, locallyManagedAlarms, session, resolvingId, resolveError, pageOffset, canGoNext]): AlarmListVm => {
            const visibleActiveAlarms = this.filterAlarmsBySession(alarms, session);
            const visibleLocallyManagedAlarms = this.filterAlarmsBySession(locallyManagedAlarms, session);

            return {
                alarms: this.mergeAlarmsForView(visibleActiveAlarms, visibleLocallyManagedAlarms),
                currentPage: Math.floor(pageOffset / this.pageLimit) + 1,
                pageLimit: this.pageLimit,
                pageOffset,
                canGoPrevious: pageOffset > 0,
                canGoNext,
                isResolving: this.pendingResolveRequests > 0,
                resolvingId,
                resolveError,
            };
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    public initialize(): void {
        this.locallyManagedAlarms$.next([]);
        this.pageOffset$.next(0);
        this.canGoNext$.next(false);
        this.loadPage(0);
    }

    public nextPage(): void {
        if (!this.canGoNext$.getValue()) {
            return;
        }

        const nextOffset = this.pageOffset$.getValue() + this.pageLimit;
        this.loadPage(nextOffset);
    }

    public previousPage(): void {
        const currentOffset = this.pageOffset$.getValue();
        if (currentOffset === 0) {
            return;
        }

        const previousOffset = Math.max(0, currentOffset - this.pageLimit);
        this.loadPage(previousOffset);
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

                    return this.resolveAlarmRequest$(activeAlarmId, numericUserId);
                }),
                tap(({ numericUserId, sourceAlarm }) => {
                    this.addLocallyManagedAlarm(activeAlarmId, numericUserId, sourceAlarm);
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

    // OSS: endpoint reparto; Admin: endpoint globale
    private getInitialActiveAlarms$(offset: number): Observable<ActiveAlarm[]> {
        return this.authService.getCurrentUser$().pipe(
            take(1),
            switchMap((session) => {
                if (session?.role === UserRole.OPERATORE_SANITARIO) {
                    return this.alarmApiService
                        .getActiveAlarmsOfOperator(session.userId, this.pageLimit, offset)
                        .pipe(map((alarms) => this.filterAlarmsBySession(alarms, session)));
                }

                return this.alarmApiService.getActiveAlarms(this.pageLimit, offset).pipe(
                    map((alarms) => this.filterAlarmsBySession(alarms, session))
                );
            })
        );
    }

    private loadPage(offset: number): void {
        this.resolveError$.next(null);

        this.getInitialActiveAlarms$(offset)
            .pipe(
                take(1),
                tap((alarms) => {
                    this.alarmStateService.setActiveAlarms(alarms, 'replace');
                    this.pageOffset$.next(offset);
                    this.canGoNext$.next(alarms.length === this.pageLimit);
                }),
                catchError((error: unknown) => {
                    this.resolveError$.next(this.mapResolveError(error));
                    return EMPTY;
                })
            )
            .subscribe();
    }

    private filterAlarmsBySession(alarms: ActiveAlarm[], session: UserSession | null): ActiveAlarm[] {

        void session;
        return alarms;
    }

    private mergeAlarmsForView(activeAlarms: ActiveAlarm[], locallyManagedAlarms: ActiveAlarm[]): ActiveAlarm[] {
        const activeAlarmIds = new Set(activeAlarms.map((alarm) => alarm.id));
        const managedOnly = locallyManagedAlarms.filter((alarm) => !activeAlarmIds.has(alarm.id));

        return [...activeAlarms, ...managedOnly];
    }

    private resolveAlarmRequest$(
        activeAlarmId: string,
        numericUserId: number
    ): Observable<{ numericUserId: number; sourceAlarm: ActiveAlarm | null }> {
        return this.alarmStateService.getActiveAlarms$().pipe(
            take(1),
            map((alarms) => this.findSourceAlarm(activeAlarmId, alarms)),
            switchMap((sourceAlarm) =>
                this.alarmApiService.resolveAlarm(activeAlarmId, numericUserId).pipe(
                    map(() => ({
                        numericUserId,
                        sourceAlarm,
                    }))
                )
            )
        );
    }

    private findSourceAlarm(activeAlarmId: string, activeAlarms: ActiveAlarm[]): ActiveAlarm | null {
        const fromActiveAlarms = activeAlarms.find((alarm) => alarm.id === activeAlarmId);
        if (fromActiveAlarms) {
            return fromActiveAlarms;
        }

        return this.locallyManagedAlarms$.getValue().find((alarm) => alarm.id === activeAlarmId) ?? null;
    }

    private addLocallyManagedAlarm(
        activeAlarmId: string,
        managerUserId: number,
        sourceAlarm: ActiveAlarm | null
    ): void {
        if (sourceAlarm === null) {
            return;
        }

        const managedAlarm: ActiveAlarm = {
            ...sourceAlarm,
            resolutionTime: sourceAlarm.resolutionTime ?? new Date().toISOString(),
            userId: managerUserId,
        };

        const currentManagedAlarms = this.locallyManagedAlarms$.getValue();
        const deduplicatedManagedAlarms = currentManagedAlarms.filter((alarm) => alarm.id !== activeAlarmId);
        this.locallyManagedAlarms$.next([managedAlarm, ...deduplicatedManagedAlarms]);
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
