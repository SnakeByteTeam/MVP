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
    const assignedPlantIds = new Set(
      this.store
        .getWardsSnapshot()
        .flatMap((ward) => ward.apartments)
        .map((apartment) => apartment.id),
    );

    return this.api.getAvailablePlants().pipe(
      map((plants) => plants.filter((plant) => !assignedPlantIds.has(plant.id))),
      map((plants) => this.toApartments(plants)),
    );
  }

  public getAvailableUsersForWard(wardId: number): Observable<Ward['operators']> {
    const assignedUserIds = new Set(
      this.store
        .getWardsSnapshot()
        .flatMap((ward) => ward.operators)
        .map((operator) => operator.id),
    );

    return this.api.getAvailableOperators().pipe(
      map((users) => users.filter((user) => !assignedUserIds.has(user.id))),
      map((users) => this.toOperators(users)),
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

  public removePlant(wardId: number, plantId: string): Observable<void> {
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
    return apartmentsDto.map((plant) => ({
      id: plant.id,
      name: plant.name,
    }));
  }

  private toOperators(operatorsDto: WardUserDto[]): Ward['operators'] {
    return operatorsDto.map((user) => ({
      id: user.id,
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
