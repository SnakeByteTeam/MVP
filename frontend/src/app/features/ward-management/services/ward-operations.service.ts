import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { UserRole } from '../../../core/models/user-role.enum';
import type {
  CreateWardDto,
  UpdateWardDto,
  WardPlantDto,
  WardSummaryDto,
  WardUserDto,
} from '../models/ward-api.dto';
import type { Ward } from '../models/ward.model';
import { WardApiService } from './ward-api.service';
import { WardStore } from './ward.store';

@Injectable()
export class WardOperationsService {
  private readonly api = inject(WardApiService);
  private readonly store = inject(WardStore);

  public loadWards(): Observable<void> {
    return this.api.getWards().pipe(
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

  public createWard(dto: CreateWardDto): Observable<void> {
    return this.api.createWard(dto).pipe(
      tap((ward) => this.store.addWard(this.normalizeMutationWard(ward))),
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

  public updateWard(wardId: number, dto: UpdateWardDto): Observable<void> {
    return this.api.updateWard(wardId, dto).pipe(
      tap((ward) => this.store.replaceWard(this.normalizeMutationWard(ward))),
      tap(() => this.store.setLoading(false)),
      map(() => void 0),
      catchError((error) => {
        this.store.setError(this.getErrorMessage(error));
        return EMPTY;
      }),
    );
  }

  public deleteWard(wardId: number): Observable<void> {
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

  private normalizeMutationWard(ward: Ward): Ward {
    const currentWard = this.store.getWardsSnapshot().find((item) => item.id === ward.id);

    return {
      id: ward.id,
      name: ward.name,
      apartments: ward.apartments ?? currentWard?.apartments ?? [],
      operators: ward.operators ?? currentWard?.operators ?? [],
    };
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

    return 'Operazione sui reparti non riuscita.';
  }
}
