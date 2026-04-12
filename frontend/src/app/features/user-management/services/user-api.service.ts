import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { UserDto } from '../models/in/user.model.dto';
import { UserCreatedResponseDto } from '../models/in/user-created-response.model.dto';
import { CreateUserDto } from '../models/out/create-user.model.dto';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { DecoderPasswordService } from './decoder-password-service';

@Injectable({ providedIn: 'root' })
export class UserApiService {

    private readonly http = inject(HttpClient);
    private readonly baseUrl: string = inject(API_BASE_URL);
    private readonly decoderPasswordService = inject(DecoderPasswordService);

    public getUsers(): Observable<UserDto[]> {
        return this.http.get<UserDto[]>(`${this.baseUrl}/users`);
    }

    public createUser(dto: CreateUserDto): Observable<UserCreatedResponseDto> {
        return this.http
            .post<UserCreatedResponseDto>(`${this.baseUrl}/users`, dto)
            .pipe(
                map((response) => ({
                    ...response,
                    tempPassword: this.decoderPasswordService.decodeTempPassword(response.tempPassword),
                })),
            );
    }

    public deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/users/${encodeURIComponent(id.toString())}`);
    }

}
