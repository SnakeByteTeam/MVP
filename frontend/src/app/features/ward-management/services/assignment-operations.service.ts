import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, catchError, map, switchMap, tap } from 'rxjs';
import { EventSubscriptionService } from '../../../core/alarm/services/event-subscription.service';
import type {
  AssignPlantDto,
  AssignOperatorDto,
} from '../models/ward-api.dto';
import type { Ward } from '../models/ward.model';
import { WardApiService } from './ward-api.service';
import { WardHydrationService } from './ward-hydration.service';
import { WardStore } from './ward.store';

@Injectable()
export class AssignmentOperationsService {
  private readonly api = inject(WardApiService);
  private readonly wardHydration = inject(WardHydrationService);
  private readonly store = inject(WardStore);
  private readonly eventSubscriptionService = inject(EventSubscriptionService, { optional: true });

  public getAvailablePlantsForWard(wardId: number): Observable<Ward['apartments']> {
    const assignedPlantIds = new Set(
      this.store
        .getWardsSnapshot()
        .flatMap((ward) => ward.apartments)
        .map((apartment) => apartment.id),
    );

    return this.api.getAvailablePlants().pipe(
      map((plants) => plants.filter((plant) => !assignedPlantIds.has(plant.id))),
      map((plants) => this.wardHydration.mapApartments(plants)),
    );
  }

  public getAvailableUsersForWard(wardId: number): Observable<Ward['operators']> {
    const ward = this.store.getWardsSnapshot().find((w) => w.id === wardId);
    const assignedUserIds = new Set((ward?.operators ?? []).map((operator) => operator.id));

    return this.api.getAvailableOperators
      ().pipe(
        map((users) => users.filter((user) => !assignedUserIds.has(user.id))),
        map((users) => this.wardHydration.mapOperators(users)),
      );
  }

  public assignOperator(wardId: number, dto: AssignOperatorDto): Observable<void> {
    return this.reloadAfter(this.api.assignOperatorToWard(wardId, dto));
  }

  public removeOperator(wardId: number, userId: number): Observable<void> {
    return this.reloadAfter(this.api.removeOperatorFromWard(wardId, userId));
  }

  public assignPlant(wardId: number, dto: AssignPlantDto): Observable<void> {
    return this.reloadAfter(this.api.assignPlantToWard(wardId, dto));
  }

  public removePlant(plantId: string): Observable<void> {
    return this.reloadAfter(this.api.removePlantFromWard(plantId));
  }

  private reloadAfter(operation$: Observable<void>): Observable<void> {
    return operation$.pipe(
      switchMap(() => this.wardHydration.loadHydratedWards()),
      tap((wards) => this.store.setWards(wards)),
      tap(() => this.store.setLoading(false)),
      tap(() => this.eventSubscriptionService?.refreshWardRoomSubscription()),
      map(() => void 0),
      catchError((error) => {
        this.store.setError(this.getErrorMessage(error));
        return EMPTY;
      }),
    );
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && typeof error.error === 'string' && error.error) {
      return error.error;
    }

    if (error instanceof HttpErrorResponse && error.message) {
      return error.message;
    }

    return 'Operazione di assegnazione non riuscita.';
  }
}
