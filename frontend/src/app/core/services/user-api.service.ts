import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
        return this.http.post<UserCreatedResponseDto>(`${this.baseUrl}/users`, dto);
    }

    public deleteUser(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
    }
}
