import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { UserRole } from '../../user-management/models/user-role.enum';
import type {
  WardPlantDto,
  WardSummaryDto,
  WardUserDto,
} from '../models/ward-api.dto';
import type { Ward } from '../models/ward.model';
import { WardApiService } from './ward-api.service';

@Injectable({ providedIn: 'root' })
export class WardHydrationService {
  private readonly api = inject(WardApiService);

  public loadHydratedWards(): Observable<Ward[]> {
    return this.api
      .getWards()
      .pipe(switchMap((wardSummaries) => this.hydrateWardSummaries(wardSummaries)));
  }

  public hydrateWardSummaries(wardSummaries: WardSummaryDto[]): Observable<Ward[]> {
    if (wardSummaries.length === 0) {
      return of([] as Ward[]);
    }

    return forkJoin(wardSummaries.map((wardSummary) => this.toWard(wardSummary)));
  }

  public mapApartments(apartmentsDto: WardPlantDto[]): Ward['apartments'] {
    return apartmentsDto.map((plant) => ({
      id: plant.id,
      name: plant.name,
    }));
  }

  public mapOperators(operatorsDto: WardUserDto[]): Ward['operators'] {
    return operatorsDto.map((user) => ({
      id: user.id,
      firstName: user.username,
      lastName: '',
      username: user.username,
      role: UserRole.OPERATORE_SANITARIO,
    }));
  }

  private toWard(wardSummary: WardSummaryDto): Observable<Ward> {
    return forkJoin({
      apartmentsDto: this.api.getPlantsByWardId(wardSummary.id),
      operatorsDto: this.api.getOperatorsByWardId(wardSummary.id),
    }).pipe(
      map(({ apartmentsDto, operatorsDto }) => ({
        id: wardSummary.id,
        name: wardSummary.name,
        apartments: this.mapApartments(apartmentsDto),
        operators: this.mapOperators(operatorsDto),
      })),
    );
  }
}