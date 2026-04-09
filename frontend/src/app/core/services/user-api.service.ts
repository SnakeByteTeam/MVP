import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { UserDto } from '../../features/user-management/models/in/user.model.dto';
import { UserCreatedResponseDto } from '../../features/user-management/models/in/user-created-response.model.dto';
import { CreateUserDto } from '../../features/user-management/models/out/create-user.model.dto';
import { API_BASE_URL } from '../tokens/api-base-url.token';

@Injectable({ providedIn: 'root' })
export class UserApiService {

    private readonly http = inject(HttpClient);
    private readonly baseUrl: string = inject(API_BASE_URL);

    public getUsers(): Observable<UserDto[]> {
        return this.http.get<UserDto[]>(`${this.baseUrl}/users`);
    }

    public createUser(dto: CreateUserDto): Observable<UserCreatedResponseDto> {
        return this.http
            .post<UserCreatedResponseDto>(`${this.baseUrl}/users`, dto)
            .pipe(
                map((response) => ({
                    ...response,
                    tempPassword: this.decodeTempPassword(response.tempPassword),
                })),
            );
    }

    public deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/users/${encodeURIComponent(id.toString())}`);
    }

    private decodeTempPassword(tempPassword: string): string {
        if (!this.isBase64Encoded(tempPassword)) {
            return tempPassword;
        }

        try {
            return atob(tempPassword);
        } catch {
            return tempPassword;
        }
    }

    private isBase64Encoded(value: string): boolean {
        const normalized = value.trim();
        if (normalized.length === 0 || normalized.length % 4 !== 0) {
            return false;
        }

        if (!/^[A-Za-z0-9+/]+={0,2}$/.test(normalized)) {
            return false;
        }

        try {
            const decoded = atob(normalized);
            const reEncoded = btoa(decoded).replace(/=+$/, '');
            const withoutPadding = normalized.replace(/=+$/, '');
            return reEncoded === withoutPadding;
        } catch {
            return false;
        }
    }

}
