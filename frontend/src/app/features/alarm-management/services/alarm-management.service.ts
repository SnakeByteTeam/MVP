import { Injectable, inject } from '@angular/core';
import { AlarmStateService } from '../../../core/alarm/services/alarm-state.service';
import { AlarmApiService } from '../../../core/alarm/services/alarm-api.service';
import { BehaviorSubject, EMPTY, combineLatest, map, shareReplay, tap, catchError, finalize, take } from 'rxjs';
import { AlarmListVm } from '../models/alarm-list-vm.model';

// Nasconde la complessità della composizione tra `AlarmStateService` e
// `AlarmApiService` dietro un'interfaccia minimale: un unico Observable `vm$`
// e un unico metodo `resolveAlarm()`.

// `vm$` è costruito tramite `combineLatest` tra `alarmStateService.getActiveAlarms$()`
// e `resolvingId$` (un `BehaviorSubject` interno). `combineLatest` garantisce
// che ogni emissione di `vm$` contenga sempre uno snapshot coerente di entrambe
// le sorgenti: non esistono frame intermedi in cui la lista degli allarmi e lo
// stato di risoluzione sono disallineati.

// **Flusso di `resolveAlarm()`:**

// 1. Imposta `resolvingId$.next(activeAlarmId)` — il ViewModel emette con `isResolving: true`
// 2. Chiama `alarmApiService.resolveAlarm(activeAlarmId)` → `PATCH /api/active-alarms/{activeAlarmId}/resolve`
// 3. Al completamento HTTP, chiama `alarmStateService.onAlarmResolved(activeAlarmId)` — la lista degli allarmi attivi si aggiorna nella sorgente di verità
// 4. Reimposta `resolvingId$.next(null)` — il ViewModel emette con `isResolving: false`

// In nessun momento questo service mantiene una propria copia della lista degli
// allarmi attivi. L'unica sorgente di verità resta `AlarmStateService`.

@Injectable({ providedIn: 'root' })
export class AlarmManagementService {
    private readonly alarmStateService = inject(AlarmStateService);
    private readonly alarmApiService = inject(AlarmApiService);

    private readonly resolvingId$ = new BehaviorSubject<string | null>(null);
    private readonly resolveError$ = new BehaviorSubject<string | null>(null);
    private pendingResolveRequests = 0;

    public readonly vm$ = combineLatest([
        this.alarmStateService.getActiveAlarms$(),
        this.resolvingId$.asObservable(),
        this.resolveError$.asObservable(),
    ]).pipe(
        map(([alarms, resolvingId, resolveError]): AlarmListVm => ({
            alarms,
            isResolving: this.pendingResolveRequests > 0,
            resolvingId,
            resolveError,
        })),
        shareReplay({ bufferSize: 1, refCount: true })
    );


    //carica storico allarmi attivi per vederli
    private loadInitialActiveAlarms(): void {
        this.alarmApiService
            .getActiveAlarms()
            .pipe(
                take(1),
                tap((alarms) => {
                    this.alarmStateService.setActiveAlarms(alarms);
                }),
                catchError((error: unknown) => {
                    this.resolveError$.next(this.mapResolveError(error));
                    return EMPTY; //da fare meglio sti errori
                })
            )
            .subscribe();
    }

    public initialize(): void {
        this.loadInitialActiveAlarms();
    }

    public resolveAlarm(activeAlarmId: string): void {
        this.pendingResolveRequests += 1;
        this.resolvingId$.next(activeAlarmId);
        this.resolveError$.next(null);

        this.alarmApiService
            .resolveAlarm(activeAlarmId)
            .pipe(
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
