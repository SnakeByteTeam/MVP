import { Injectable, inject } from "@angular/core";
import { AlarmApiService } from "../../../core/alarm/services/alarm-api.service";
import { InternalAuthService } from "../../../core/services/internal-auth.service";
import { ApiErrorDisplayService } from "../../../core/services/api-error-display.service";
import {
    BehaviorSubject,
    catchError,
    combineLatest,
    map,
    of,
    shareReplay,
    switchMap,
    take,
} from "rxjs";
import { AlarmListVm } from "../models/alarm-list-vm.model";
import { ActiveAlarm } from "../../../core/alarm/models/active-alarm.model";

@Injectable({ providedIn: 'root' })
export class AlarmHistoryService {
    private readonly alarmApiService = inject(AlarmApiService);
    private readonly authService = inject(InternalAuthService);
    private readonly apiErrorDisplayService = inject(ApiErrorDisplayService);
    private readonly pageLimit = 6;

    private readonly pageOffset$ = new BehaviorSubject<number>(0);
    private readonly canGoNext$ = new BehaviorSubject<boolean>(false);
    private readonly alarms$ = new BehaviorSubject<ActiveAlarm[]>([]);

    public readonly vm$ = combineLatest([
        this.alarms$.asObservable(),
        this.pageOffset$.asObservable(),
        this.canGoNext$.asObservable(),
    ]).pipe(
        map(([alarms, pageOffset, canGoNext]): AlarmListVm => ({
            alarms,
            currentPage: Math.floor(pageOffset / this.pageLimit) + 1,
            pageLimit: this.pageLimit,
            pageOffset,
            canGoPrevious: pageOffset > 0,
            canGoNext,
        })),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    public initialize(): void {
        this.pageOffset$.next(0);
        this.canGoNext$.next(false);
        this.loadPage(0);
    }

    public nextPage(): void {
        if (!this.canGoNext$.getValue()) return;
        this.loadPage(this.pageOffset$.getValue() + this.pageLimit);
    }

    public previousPage(): void {
        const currentOffset = this.pageOffset$.getValue();
        if (currentOffset === 0) return;
        this.loadPage(Math.max(0, currentOffset - this.pageLimit));
    }

    private loadPage(offset: number): void {
        this.authService.getCurrentUser$().pipe(
            take(1),
            switchMap((session) => {
                const numericUserId = Number(session?.userId);
                if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
                    throw new TypeError('Utente corrente non valido.');
                }
                return this.alarmApiService.getResolvedAlarms(
                    numericUserId,
                    this.pageLimit + 1,
                    offset
                );
            }),
            catchError(() => of([]))
        ).subscribe({
            next: (alarms: ActiveAlarm[]) => {
                const hasNext = alarms.length > this.pageLimit;
                this.alarms$.next(hasNext ? alarms.slice(0, this.pageLimit) : alarms);
                this.canGoNext$.next(hasNext);
                this.pageOffset$.next(offset);
            },
        });
    }
}