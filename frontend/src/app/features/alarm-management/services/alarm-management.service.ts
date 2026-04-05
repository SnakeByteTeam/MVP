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
import { ApiErrorDisplayService } from '../../../core/services/api-error-display.service';
import { AlarmListVm } from '../models/alarm-list-vm.model';

@Injectable({ providedIn: 'root' })
export class AlarmManagementService {
    private readonly alarmStateService = inject(AlarmStateService);
    private readonly alarmApiService = inject(AlarmApiService);
    private readonly authService = inject(InternalAuthService);
    private readonly apiErrorDisplayService = inject(ApiErrorDisplayService);
    private readonly pageLimit = 6;

    private readonly resolvingId$ = new BehaviorSubject<string | null>(null);
    private readonly resolveError$ = new BehaviorSubject<string | null>(null);
    private readonly pageOffset$ = new BehaviorSubject<number>(0);
    private readonly canGoNext$ = new BehaviorSubject<boolean>(false);
    private pendingResolveRequests = 0;

    public readonly vm$ = combineLatest([
        this.alarmStateService.getActiveAlarms$(),
        this.resolvingId$.asObservable(),
        this.resolveError$.asObservable(),
        this.pageOffset$.asObservable(),
        this.canGoNext$.asObservable(),
    ]).pipe(
        map(([alarms, resolvingId, resolveError, pageOffset, canGoNext]): AlarmListVm => {
            return {
                alarms,
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

                    return this.alarmApiService.resolveAlarm(activeAlarmId, numericUserId);
                }),
                tap(() => {
                    this.alarmStateService.onAlarmResolved(activeAlarmId);
                    this.loadPage(this.pageOffset$.getValue(), true);
                }),
                catchError((error: unknown) => {
                    this.resolveError$.next(
                        this.apiErrorDisplayService.toMessage(error, {
                            actionLabel: "completare la risoluzione dell'allarme",
                            fallbackMessage: "Errore durante la risoluzione dell'allarme.",
                            nonHttpStrategy: 'message',
                        }),
                    );
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
                    return this.alarmApiService.getActiveAlarmsOfOperator(session.userId, this.pageLimit, offset);
                }

                return this.alarmApiService.getActiveAlarms(this.pageLimit, offset);
            })
        );
    }

    private loadPage(offset: number, fallbackToPreviousIfEmpty = false): void {
        this.resolveError$.next(null);

        this.getInitialActiveAlarms$(offset)
            .pipe(
                take(1),
                tap((alarms) => {
                    if (fallbackToPreviousIfEmpty && offset > 0 && alarms.length === 0) {
                        const previousOffset = Math.max(0, offset - this.pageLimit);
                        this.loadPage(previousOffset);
                        return;
                    }

                    this.alarmStateService.setActiveAlarms(alarms, 'replace');
                    this.pageOffset$.next(offset);
                    this.canGoNext$.next(alarms.length === this.pageLimit);
                }),
                catchError((error: unknown) => {
                    this.resolveError$.next(
                        this.apiErrorDisplayService.toMessage(error, {
                            actionLabel: 'caricare gli allarmi attivi',
                            fallbackMessage: 'Errore durante il caricamento degli allarmi attivi.',
                            nonHttpStrategy: 'message',
                        }),
                    );
                    return EMPTY;
                })
            )
            .subscribe();
    }
}
