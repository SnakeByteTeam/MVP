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
import { InternalAuthService } from '../../user-auth/services/internal-auth.service';
import { ApiErrorDisplayService } from '../../../core/services/api-error-display.service';
import { AlarmListVm } from '../models/alarm-list-vm.model';
import { AlarmManagementPaginationService } from './alarm-management-pagination.service';
import type { UserSession } from '../../user-auth/models/user-session.model';

@Injectable({ providedIn: 'root' })
export class AlarmManagementService {
    private readonly alarmStateService = inject(AlarmStateService);
    private readonly alarmApiService = inject(AlarmApiService);
    private readonly authService = inject(InternalAuthService);
    private readonly apiErrorDisplayService = inject(ApiErrorDisplayService);
    private readonly paginationService = inject(AlarmManagementPaginationService);

    private readonly resolvingId$ = new BehaviorSubject<string | null>(null);
    private readonly resolveError$ = new BehaviorSubject<string | null>(null);
    private pendingResolveRequests = 0;

    public readonly vm$ = combineLatest([
        this.alarmStateService.getActiveAlarms$(),
        this.resolvingId$.asObservable(),
        this.resolveError$.asObservable(),
        this.paginationService.pageOffset$,
        this.paginationService.canGoNext$,
    ]).pipe(
        map(([alarms, resolvingId, resolveError, pageOffset, canGoNext]): AlarmListVm => {
            return {
                alarms,
                currentPage: this.paginationService.toPageNumber(pageOffset),
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
        this.paginationService.reset();
        this.loadPage(0);
    }

    public nextPage(): void {
        if (!this.paginationService.canGoNext()) {
            return;
        }

        this.loadPage(this.paginationService.getNextOffset());
    }

    public previousPage(): void {
        if (!this.paginationService.canGoPrevious()) {
            return;
        }

        this.loadPage(this.paginationService.getPreviousOffset());
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
                    this.loadPage(this.paginationService.getOffset(), true);
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

    private loadPage(offset: number, fallbackToPreviousIfEmpty = false): void {
        this.resolveError$.next(null);

        this.authService
            .getCurrentUser$()
            .pipe(
                take(1),
                switchMap((session) => this.loadPageState$(session, offset, fallbackToPreviousIfEmpty)),
                tap(({ alarms, pageOffset, canGoNext }) => {
                    this.alarmStateService.setActiveAlarms(alarms, 'replace');
                    this.paginationService.update(pageOffset, canGoNext);
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

    private getActiveAlarmsForSession$(session: UserSession | null, offset: number): Observable<ActiveAlarm[]> {
        const numericUserId = Number(session?.userId);
        if (!Number.isInteger(numericUserId)) {
            throw new TypeError('Utente corrente non valido per caricare gli allarmi attivi.');
        }

        return this.alarmApiService.getActiveAlarms(numericUserId, this.paginationService.pageLimit, offset);
    }

    private loadPageState$(
        session: UserSession | null,
        offset: number,
        fallbackToPreviousIfEmpty = false,
    ): Observable<{ alarms: ActiveAlarm[]; pageOffset: number; canGoNext: boolean }> {
        return this.getActiveAlarmsForSession$(session, offset).pipe(
            take(1),
            switchMap((alarms) => {
                if (fallbackToPreviousIfEmpty && offset > 0 && alarms.length === 0) {
                    const previousOffset = Math.max(0, offset - this.paginationService.pageLimit);

                    return this.getActiveAlarmsForSession$(session, previousOffset).pipe(
                        take(1),
                        switchMap((previousAlarms) =>
                            this.getActiveAlarmsForSession$(session, previousOffset + this.paginationService.pageLimit).pipe(
                                take(1),
                                map((nextAlarms) => ({
                                    alarms: previousAlarms,
                                    pageOffset: previousOffset,
                                    canGoNext: nextAlarms.length > 0,
                                })),
                            ),
                        ),
                    );
                }

                return this.getActiveAlarmsForSession$(session, offset + this.paginationService.pageLimit).pipe(
                    take(1),
                    map((nextAlarms) => ({
                        alarms,
                        pageOffset: offset,
                        canGoNext: nextAlarms.length > 0,
                    })),
                );
            }),
        );
    }
}
