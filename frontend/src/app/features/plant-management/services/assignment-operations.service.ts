import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, catchError, map, switchMap, tap } from 'rxjs';
import type { AssignApartmentDto, AssignOperatorDto } from '../models/plant-api.dto';
import { PlantApiService } from './plant-api.service';
import { WardStore } from './ward.store';

@Injectable()
export class AssignmentOperationsService {
  private readonly api = inject(PlantApiService);
  private readonly store = inject(WardStore);

  public assignOperator(wardId: string, dto: AssignOperatorDto): Observable<void> {
    return this.reloadAfter(this.api.assignOperatorToWard(wardId, dto));
  }

  public removeOperator(wardId: string, userId: string): Observable<void> {
    return this.reloadAfter(this.api.removeOperatorFromWard(wardId, userId));
  }

  public assignApartment(wardId: string, dto: AssignApartmentDto): Observable<void> {
    return this.reloadAfter(this.api.assignApartmentToWard(wardId, dto));
  }

  public removeApartment(wardId: string, apartmentId: string): Observable<void> {
    return this.reloadAfter(this.api.removeApartmentFromWard(wardId, apartmentId));
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
