import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import type {
    AssignApartmentDto,
    AssignOperatorDto,
    CreateWardDto,
    UpdateWardDto,
} from '../models/plant-api.dto';
import type { Ward } from '../models/ward.model';

@Injectable({ providedIn: 'root' })
export class PlantApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl: string = inject(API_BASE_URL);
    private readonly wardsEndpoint = `${this.baseUrl}/api/wards`;

    public getWards(): Observable<Ward[]> {
        return this.http.get<Ward[]>(this.wardsEndpoint);
    }

    public createWard(dto: CreateWardDto): Observable<Ward> {
        return this.http.post<Ward>(this.wardsEndpoint, dto);
    }

    public updateWard(wardId: string, dto: UpdateWardDto): Observable<Ward> {
        return this.http.put<Ward>(`${this.wardsEndpoint}/${encodeURIComponent(wardId)}`, dto);
    }

    public deleteWard(wardId: string): Observable<void> {
        return this.http.delete<void>(`${this.wardsEndpoint}/${encodeURIComponent(wardId)}`);
    }

    public assignOperatorToWard(wardId: string, dto: AssignOperatorDto): Observable<void> {
        return this.http.post<void>(
            `${this.wardsEndpoint}/${encodeURIComponent(wardId)}/operators`,
            dto,
        );
    }

    public removeOperatorFromWard(wardId: string, userId: string): Observable<void> {
        return this.http.delete<void>(
            `${this.wardsEndpoint}/${encodeURIComponent(wardId)}/operators/${encodeURIComponent(userId)}`,
        );
    }

    public assignApartmentToWard(wardId: string, dto: AssignApartmentDto): Observable<void> {
        return this.http.post<void>(
            `${this.wardsEndpoint}/${encodeURIComponent(wardId)}/apartments`,
            dto,
        );
    }

    public removeApartmentFromWard(wardId: string, apartmentId: string): Observable<void> {
        return this.http.delete<void>(
            `${this.wardsEndpoint}/${encodeURIComponent(wardId)}/apartments/${encodeURIComponent(apartmentId)}`,
        );
    }
}
