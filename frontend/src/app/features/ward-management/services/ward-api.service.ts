import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import type {
    AssignPlantDto,
    AssignOperatorDto,
    CreateWardDto,
    UpdateWardDto,
} from '../models/ward-api.dto';
import type { Ward } from '../models/ward.model';

@Injectable({ providedIn: 'root' })
export class WardApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl: string = inject(API_BASE_URL);
    private readonly wardsEndpoint = `${this.baseUrl}/api/wards`;
    private readonly wardUsersRelationshipsEndpoint = `${this.baseUrl}/api/wards-users-relationships`;
    private readonly wardPlantsRelationshipsEndpoint = `${this.baseUrl}/api/wards-plants-relationships`;

    public getWards(): Observable<Ward[]> {
        return this.http.get<Ward[]>(this.wardsEndpoint);
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

    public assignPlantToWard(wardId: number, dto: AssignPlantDto): Observable<void> {
        return this.http.post<void>(this.wardPlantsRelationshipsEndpoint, {
            wardId,
            plantId: dto.plantId,
        });
    }

    public removePlantFromWard(wardId: number, plantId: number): Observable<void> {
        return this.http.delete<void>(
            `${this.wardPlantsRelationshipsEndpoint}/${encodeURIComponent(String(wardId))}/${encodeURIComponent(String(plantId))}`,
        );
    }
}
