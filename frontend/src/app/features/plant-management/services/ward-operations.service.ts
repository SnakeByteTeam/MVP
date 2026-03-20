import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, catchError, map, tap } from 'rxjs';
import type { CreateWardDto, UpdateWardDto } from '../models/plant-api.dto';
import { PlantApiService } from './plant-api.service';
import { WardStore } from './ward.store';

@Injectable()
export class WardOperationsService {
  private readonly api = inject(PlantApiService);
  private readonly store = inject(WardStore);

  public loadWards(): Observable<void> {
    return this.api.getWards().pipe(
      tap((wards) => this.store.setWards(wards)),
      tap(() => this.store.setLoading(false)),
      map(() => void 0),
      catchError((error) => {
        this.store.setError(this.getErrorMessage(error));
        return EMPTY;
      }),
    );
  }

  public createWard(dto: CreateWardDto): Observable<void> {
    return this.api.createWard(dto).pipe(
      tap((ward) => this.store.addWard(ward)),
      tap(() => this.store.setLoading(false)),
      map(() => void 0),
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 409) {
          this.store.setError('Esiste gia un reparto con questo nome.');
          return EMPTY;
        }

        this.store.setError(this.getErrorMessage(error));
        return EMPTY;
      }),
    );
  }

  public updateWard(wardId: string, dto: UpdateWardDto): Observable<void> {
    return this.api.updateWard(wardId, dto).pipe(
      tap((ward) => this.store.replaceWard(ward)),
      tap(() => this.store.setLoading(false)),
      map(() => void 0),
      catchError((error) => {
        this.store.setError(this.getErrorMessage(error));
        return EMPTY;
      }),
    );
  }

  public deleteWard(wardId: string): Observable<void> {
    return this.api.deleteWard(wardId).pipe(
      tap(() => this.store.removeWard(wardId)),
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

    return 'Operazione sui reparti non riuscita.';
  }
}
