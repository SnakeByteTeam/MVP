import { Injectable, inject } from '@angular/core';
import {
    Observable,
    catchError,
    forkJoin,
    map,
    of,
    shareReplay,
    switchMap,
} from 'rxjs';
import { UserRole } from '../../../core/models/user-role.enum';
import { InternalAuthService } from '../../../core/services/internal-auth.service';
import { WardApiService } from '../../ward-management/services/ward-api.service';

export interface OperatorAlarmScopeContext {
    isOperator: boolean;
    assignedWardIds: number[];
    assignedPlantIds: string[];
    errorMessage: string | null;
}

@Injectable({ providedIn: 'root' })
export class OperatorAlarmScopeService {
    private readonly authService = inject(InternalAuthService);
    private readonly wardApiService = inject(WardApiService);

    public readonly context$: Observable<OperatorAlarmScopeContext> = this.authService.getCurrentUser$().pipe(
        switchMap((session) => {


            if (session?.role !== UserRole.OPERATORE_SANITARIO) {
                return of<OperatorAlarmScopeContext>({
                    isOperator: false,
                    assignedWardIds: [],
                    assignedPlantIds: [],
                    errorMessage: null,
                });
            }

            return this.resolveAssignedWardIds(session.userId).pipe(
                switchMap((assignedWardIds) =>
                    this.resolveAssignedPlantIds(assignedWardIds).pipe(
                        map(
                            (assignedPlantIds): OperatorAlarmScopeContext => ({
                                isOperator: true,
                                assignedWardIds,
                                assignedPlantIds,
                                errorMessage: null,
                            })
                        )
                    )
                ),
                catchError(() =>
                    of<OperatorAlarmScopeContext>({
                        isOperator: true,
                        assignedWardIds: [],
                        assignedPlantIds: [],
                        errorMessage: 'Impossibile caricare i reparti assegnati.',
                    })
                )
            );
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    private resolveAssignedWardIds(userId: string): Observable<number[]> {
        return this.wardApiService.getWards().pipe(
            switchMap((wards) => {
                if (wards.length === 0) {
                    return of<number[]>([]);
                }

                return forkJoin(
                    wards.map((ward) => this.resolveUserWardMembership(userId, ward.id))
                ).pipe(
                    map((wardIds) =>
                        Array.from(new Set(wardIds.filter((wardId): wardId is number => wardId !== null)))
                    )
                );
            })
        );
    }

    private resolveAssignedPlantIds(wardIds: number[]): Observable<string[]> {
        if (wardIds.length === 0) {
            return of<string[]>([]);
        }

        return forkJoin(
            wardIds.map((wardId) =>
                this.wardApiService.getPlantsByWardId(wardId).pipe(
                    map((plants) => plants.map((plant) => plant.id.trim()).filter((plantId) => plantId.length > 0)),
                    catchError(() => of<string[]>([]))
                )
            )
        ).pipe(
            map((plantGroups) => Array.from(new Set(plantGroups.flat())))
        );
    }

    private resolveUserWardMembership(userId: string, wardId: number): Observable<number | null> {
        return this.wardApiService.getOperatorsByWardId(wardId).pipe(
            map((operators) =>
                operators.some((operator) => String(operator.id) === userId) ? wardId : null
            ),
            catchError(() => of<number | null>(null))
        );
    }
}
