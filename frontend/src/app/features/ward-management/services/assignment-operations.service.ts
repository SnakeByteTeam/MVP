import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, catchError, map, switchMap, tap } from 'rxjs';
import type { AssignPlantDto, AssignOperatorDto } from '../models/ward-api.dto';
import { WardApiService } from './ward-api.service';
import { WardStore } from './ward.store';

@Injectable()
export class AssignmentOperationsService {
  private readonly api = inject(WardApiService);
  private readonly store = inject(WardStore);

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
      tap((wards) => this.store.setWards(wards)),
      tap(() => this.store.setLoading(false)),
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
