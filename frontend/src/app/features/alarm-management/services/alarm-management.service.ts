import { Injectable, inject } from '@angular/core';
import { AlarmStateService } from '../../../core/alarm/services/alarm-state.service';
import { AlarmApiService } from '../../../core/alarm/services/alarm-api.service';
import {
    BehaviorSubject,
    EMPTY,
    Observable,
    combineLatest,
    forkJoin,
    map,
    of,
    shareReplay,
    startWith,
    switchMap,
    tap,
    catchError,
    finalize,
    take,
} from 'rxjs';
import { ActiveAlarm } from '../../../core/alarm/models/active-alarm.model';
import { AlarmListVm, AlarmScope } from '../models/alarm-list-vm.model';
import { AlarmRuleLookupService } from './alarm-rule-lookup.service';
import { OperatorAlarmScopeContext, OperatorAlarmScopeService } from './operator-alarm-scope.service';

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
// 2. Chiama `alarmApiService.resolveAlarm(activeAlarmId)` → `PATCH /active-alarms/{activeAlarmId}/resolve`
// 3. Al completamento HTTP, chiama `alarmStateService.onAlarmResolved(activeAlarmId)` — la lista degli allarmi attivi si aggiorna nella sorgente di verità
// 4. Reimposta `resolvingId$.next(null)` — il ViewModel emette con `isResolving: false`

// In nessun momento questo service mantiene una propria copia della lista degli
// allarmi attivi. L'unica sorgente di verità resta `AlarmStateService`.

@Injectable({ providedIn: 'root' })
export class AlarmManagementService {
    private readonly alarmStateService = inject(AlarmStateService);
    private readonly alarmApiService = inject(AlarmApiService);
    private readonly alarmRuleLookupService = inject(AlarmRuleLookupService);
    private readonly operatorAlarmScopeService = inject(OperatorAlarmScopeService);

    private readonly resolvingId$ = new BehaviorSubject<string | null>(null);
    private readonly resolveError$ = new BehaviorSubject<string | null>(null);
    private readonly activeScope$ = new BehaviorSubject<AlarmScope>('all');
    private pendingResolveRequests = 0;

    private readonly scopeSelection$ = combineLatest([
        this.activeScope$.asObservable(),
        this.operatorAlarmScopeService.context$,
    ]).pipe(
        map(([requestedScope, context]): ScopeSelection => {
            const availableScopes: AlarmScope[] = context.isOperator ? ['all', 'mine'] : ['all'];
            const activeScope = availableScopes.includes(requestedScope) ? requestedScope : 'all';

            return {
                activeScope,
                availableScopes,
                context,
            };
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    private readonly scopedAlarms$ = combineLatest([
        this.alarmStateService.getActiveAlarms$(),
        this.scopeSelection$,
    ]).pipe(
        switchMap(([alarms, scopeSelection]) => this.resolveScopedAlarms$(alarms, scopeSelection)),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    public readonly vm$ = combineLatest([
        this.scopedAlarms$,
        this.resolvingId$.asObservable(),
        this.resolveError$.asObservable(),
        this.scopeSelection$,
    ]).pipe(
        map(([scopedAlarms, resolvingId, resolveError, scopeSelection]): AlarmListVm => ({
            alarms: scopedAlarms.alarms,
            isResolving: this.pendingResolveRequests > 0,
            resolvingId,
            resolveError,
            activeScope: scopeSelection.activeScope,
            availableScopes: scopeSelection.availableScopes,
            scopeInfoMessage: scopedAlarms.scopeInfoMessage,
            scopeLoading: scopedAlarms.scopeLoading,
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

    public switchScope(scope: AlarmScope): void {
        this.activeScope$.next(scope);
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

    private resolveScopedAlarms$(alarms: ActiveAlarm[], scopeSelection: ScopeSelection): Observable<ScopedAlarmsResult> {
        if (scopeSelection.activeScope === 'all') {
            return of({
                alarms,
                scopeInfoMessage: null,
                scopeLoading: false,
            });
        }

        const context = scopeSelection.context;
        if (context.errorMessage) {
            return of({
                alarms: [],
                scopeInfoMessage: context.errorMessage,
                scopeLoading: false,
            });
        }

        if (context.assignedWardIds.length === 0 || context.assignedPlantIds.length === 0) {
            return of({
                alarms: [],
                scopeInfoMessage: 'Non hai reparti assegnati.',
                scopeLoading: false,
            });
        }

        if (alarms.length === 0) {
            return of({
                alarms: [],
                scopeInfoMessage: 'Nessun allarme attivo nei reparti assegnati.',
                scopeLoading: false,
            });
        }

        return this.filterMineAlarms$(alarms, new Set(context.assignedPlantIds)).pipe(
            map((filteredAlarms): ScopedAlarmsResult => ({
                alarms: filteredAlarms,
                scopeInfoMessage:
                    filteredAlarms.length === 0 ? 'Nessun allarme attivo nei reparti assegnati.' : null,
                scopeLoading: false,
            })),
            startWith({
                alarms: [],
                scopeInfoMessage: null,
                scopeLoading: true,
            })
        );
    }

    private filterMineAlarms$(alarms: ActiveAlarm[], assignedPlantIds: ReadonlySet<string>): Observable<ActiveAlarm[]> {
        if (alarms.length === 0 || assignedPlantIds.size === 0) {
            return of([]);
        }

        return forkJoin(
            alarms.map((alarm) =>
                this.alarmRuleLookupService.getAlarmRuleById(alarm.alarmRuleId).pipe(
                    map((alarmRule) => {
                        if (!alarmRule) {
                            return null;
                        }

                        const plantId = alarmRule.apartmentId.trim();
                        if (!plantId || !assignedPlantIds.has(plantId)) {
                            return null;
                        }

                        return alarm;
                    })
                )
            )
        ).pipe(
            map((matchingAlarms) =>
                matchingAlarms.filter((alarm): alarm is ActiveAlarm => alarm !== null)
            )
        );
    }

}

interface ScopeSelection {
    activeScope: AlarmScope;
    availableScopes: AlarmScope[];
    context: OperatorAlarmScopeContext;
}

interface ScopedAlarmsResult {
    alarms: ActiveAlarm[];
    scopeInfoMessage: string | null;
    scopeLoading: boolean;
}
