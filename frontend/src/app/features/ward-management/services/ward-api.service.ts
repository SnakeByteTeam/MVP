import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import type {
    AssignPlantDto,
    AssignOperatorDto,
    CreateWardDto,
    UpdateWardDto,
    WardSummaryDto,
    WardUserDto,
    WardPlantDto,
} from '../models/ward-api.dto';
import type { Ward } from '../models/ward.model';

@Injectable({ providedIn: 'root' })
export class WardApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl: string = inject(API_BASE_URL);
    private readonly wardsEndpoint = `${this.baseUrl}/wards`;
    private readonly wardUsersRelationshipsEndpoint = `${this.baseUrl}/wards-users-relationships`;
    private readonly wardPlantsRelationshipsEndpoint = `${this.baseUrl}/wards-plants-relationships`;
    private readonly plantEndpoint = `${this.baseUrl}/plant`;
    private readonly usersEndpoint = `${this.baseUrl}/users`;

    public getWards(): Observable<WardSummaryDto[]> {
        return this.http.get<WardSummaryDto[]>(this.wardsEndpoint);
    }

    public createWard(dto: CreateWardDto): Observable<Ward> {
        return this.http.post<Ward>(this.wardsEndpoint, dto);
    }

    public updateWard(wardId: number, dto: UpdateWardDto): Observable<Ward> {
        return this.http.put<Ward>(`${this.wardsEndpoint}/${encodeURIComponent(String(wardId))}`, dto);
    }

    public deleteWard(wardId: number): Observable<void> {
        return this.http.delete<void>(`${this.wardsEndpoint}/${encodeURIComponent(String(wardId))}`);
    }



    public getOperatorsByWardId(wardId: number): Observable<WardUserDto[]> {
        return this.http.get<WardUserDto[]>(
            `${this.wardUsersRelationshipsEndpoint}/${encodeURIComponent(String(wardId))}`,
        );
    }

    public getAvailableOperators(): Observable<WardUserDto[]> {
        return this.http.get<WardUserDto[]>(
            `${this.usersEndpoint}`,
        );
    }
    public assignOperatorToWard(wardId: number, dto: AssignOperatorDto): Observable<void> {
        return this.http.post<void>(this.wardUsersRelationshipsEndpoint, {
            wardId,
            userId: dto.userId,
        });
    }

    public removeOperatorFromWard(wardId: number, userId: number): Observable<void> {
        return this.http.delete<void>(
            `${this.wardUsersRelationshipsEndpoint}/${encodeURIComponent(String(wardId))}/${encodeURIComponent(String(userId))}`,
        );
    }


    public getPlantsByWardId(wardId: number): Observable<WardPlantDto[]> {
        return this.http.get<WardPlantDto[]>(
            `${this.wardPlantsRelationshipsEndpoint}/${encodeURIComponent(String(wardId))}`,
        );
    }

    public getAvailablePlants(): Observable<WardPlantDto[]> {
        return this.http.get<WardPlantDto[]>(
            `${this.plantEndpoint}/all`,
        );
    }


    public assignPlantToWard(wardId: number, dto: AssignPlantDto): Observable<void> {
        return this.http.post<void>(this.wardPlantsRelationshipsEndpoint, {
            wardId,
            plantId: dto.plantId,
        });
    }


    public removePlantFromWard(wardId: number, plantId: string): Observable<void> {
        return this.http.delete<void>(
            `${this.wardPlantsRelationshipsEndpoint}/${encodeURIComponent(String(plantId))}`,
        );
    }
}
