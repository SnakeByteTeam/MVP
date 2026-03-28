import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { UserRole } from '../../../core/models/user-role.enum';
import type {
  AssignPlantDto,
  AssignOperatorDto,
  WardPlantDto,
  WardSummaryDto,
  WardUserDto,
} from '../models/ward-api.dto';
import type { Ward } from '../models/ward.model';
import { WardApiService } from './ward-api.service';
import { WardStore } from './ward.store';

@Injectable()
export class AssignmentOperationsService {
  private readonly api = inject(WardApiService);
  private readonly store = inject(WardStore);

  public getAvailablePlantsForWard(wardId: number): Observable<Ward['apartments']> {
    const selectedWard = this.store.getWardsSnapshot().find((ward) => ward.id === wardId);
    const assignedToSelectedWard = new Set((selectedWard?.apartments ?? []).map((apartment) => apartment.id));

    return this.api.getAvailablePlants().pipe(
      map((plants) => plants.filter((plant) => !assignedToSelectedWard.has(plant.id))),
      map((plants) => this.toApartments(plants)),
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

  public removePlant(wardId: number, plantId: number): Observable<void> {
    return this.reloadAfter(this.api.removePlantFromWard(wardId, plantId));
  }

  private reloadAfter(operation$: Observable<void>): Observable<void> {
    return operation$.pipe(
      switchMap(() => this.api.getWards()),
      switchMap((wardSummaries) => {
        if (wardSummaries.length === 0) {
          return of([] as Ward[]);
        }

        return forkJoin(wardSummaries.map((wardSummary) => this.toWard(wardSummary)));
      }),
      tap((wards) => this.store.setWards(wards)),
      tap(() => this.store.setLoading(false)),
      map(() => void 0),
      catchError((error) => {
        this.store.setError(this.getErrorMessage(error));
        return EMPTY;
      }),
    );
  }

  private toWard(wardSummary: WardSummaryDto): Observable<Ward> {
    return forkJoin({
      apartmentsDto: this.api.getPlantsByWardId(wardSummary.id),
      operatorsDto: this.api.getOperatorsByWardId(wardSummary.id),
    }).pipe(
      map(({ apartmentsDto, operatorsDto }) => ({
        id: wardSummary.id,
        name: wardSummary.name,
        apartments: this.toApartments(apartmentsDto),
        operators: this.toOperators(operatorsDto),
      })),
    );
  }

  private toApartments(apartmentsDto: WardPlantDto[]): Ward['apartments'] {
    const currentWards = this.store.getWardsSnapshot();
    const enabledByPlantId = new Map<number, boolean>();

    for (const ward of currentWards) {
      for (const apartment of ward.apartments) {
        if (!enabledByPlantId.has(apartment.id)) {
          enabledByPlantId.set(apartment.id, apartment.isEnabled);
        }
      }
    }

    return apartmentsDto.map((plant) => ({
      id: plant.id,
      name: plant.name,
      isEnabled: plant.isEnabled ?? enabledByPlantId.get(plant.id) ?? true,
    }));
  }

  private toOperators(operatorsDto: WardUserDto[]): Ward['operators'] {
    return operatorsDto.map((user) => ({
      id: String(user.id),
      firstName: user.username,
      lastName: '',
      username: user.username,
      role: UserRole.OPERATORE_SANITARIO,
    }));
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
