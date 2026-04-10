import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, catchError, shareReplay, switchMap, tap, of } from 'rxjs';
import { UserApiService } from './user-api.service';
import { UserDto } from '../models/in/user.model.dto';
import { UserCreatedResponseDto } from '../models/in/user-created-response.model.dto';
import { UserManagementErrorType } from '../models/user-management-error-type.enum';
import { CreateUserDto } from '../models/out/create-user.model.dto';

@Injectable()
export class UserManagementPageStateService {
    private readonly userApi = inject(UserApiService);
    private readonly refreshTrigger$ = new BehaviorSubject<void>(undefined);

    public readonly users$: Observable<UserDto[]> = this.refreshTrigger$.pipe(
        switchMap(() =>
            this.userApi.getUsers().pipe(
                catchError((err: unknown) => {
                    console.error('Errore durante il caricamento degli utenti:', err);
                    return of([] as UserDto[]);
                }),
            ),
        ),
        shareReplay({ bufferSize: 1, refCount: true }),
    );

    public readonly createdResponse = signal<UserCreatedResponseDto | null>(null);
    public readonly createdUser = signal<CreateUserDto | null>(null);
    public readonly formError = signal<UserManagementErrorType | null>(null);
    public readonly isCreateFormOpen = signal(false);

    public openCreateForm(): void {
        this.isCreateFormOpen.set(true);
    }

    public closeCreateForm(): void {
        this.isCreateFormOpen.set(false);
    }

    public submitUser(dto: CreateUserDto): Observable<UserCreatedResponseDto> {
        this.formError.set(null);

        return this.userApi.createUser(dto).pipe(
            tap((response) => {
                this.createdResponse.set(response);
                this.createdUser.set(dto);
                this.formError.set(null);
                this.refreshTrigger$.next();
            }),
            catchError((err: unknown) => {
                this.formError.set(this.mapFormError(err));
                return EMPTY;
            }),
        );
    }

    public deleteUser(id: number): Observable<void> {
        return this.userApi.deleteUser(id).pipe(
            tap(() => {
                this.refreshTrigger$.next();
            }),
            catchError((err: unknown) => {
                console.error("Errore durante l'eliminazione:", err);
                return EMPTY;
            }),
        );
    }

    public closeDialog(): void {
        this.createdResponse.set(null);
        this.createdUser.set(null);
    }

    private mapFormError(err: unknown): UserManagementErrorType {
        if (this.isHttpStatus(err, 409)) {
            return UserManagementErrorType.USERNAME_ALREADY_IN_USE;
        }

        return UserManagementErrorType.OTHER_ERROR;
    }

    private isHttpStatus(err: unknown, status: number): err is { status: number } {
        return typeof err === 'object' && err !== null && 'status' in err && (err as { status: number }).status === status;
    }
}