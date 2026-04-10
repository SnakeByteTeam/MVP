import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, take, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserManagementPageStateService } from './user-management-page-state.service';
import { UserApiService } from './user-api.service';
import { UserManagementErrorType } from '../models/user-management-error-type.enum';
import { UserRole } from '../../../core/models/user-role.enum';

describe('UserManagementPageStateService', () => {
    let service: UserManagementPageStateService;

    const getUsersMock = vi.fn();
    const createUserMock = vi.fn();
    const deleteUserMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        getUsersMock.mockReturnValue(of([]));
        createUserMock.mockReturnValue(of({ tempPassword: 'TempPass123' }));
        deleteUserMock.mockReturnValue(of(void 0));

        TestBed.configureTestingModule({
            providers: [
                UserManagementPageStateService,
                {
                    provide: UserApiService,
                    useValue: {
                        getUsers: getUsersMock,
                        createUser: createUserMock,
                        deleteUser: deleteUserMock,
                    },
                },
            ],
        });

        service = TestBed.inject(UserManagementPageStateService);
    });

    it('carica gli utenti subito e li ricarica dopo un refresh', async () => {
        const firstUsers = [{ id: 1, name: 'Mario', surname: 'Rossi', username: 'mrossi', role: UserRole.OPERATORE_SANITARIO }];
        const secondUsers = [{ id: 2, name: 'Anna', surname: 'Verdi', username: 'averdi', role: UserRole.OPERATORE_SANITARIO }];

        getUsersMock
            .mockReturnValueOnce(of(firstUsers))
            .mockReturnValueOnce(of(secondUsers));

        const usersValues: unknown[] = [];
        const subscription = service.users$.subscribe((users) => usersValues.push(users));

        expect(getUsersMock).toHaveBeenCalledTimes(1);
        expect(usersValues.at(-1)).toEqual(firstUsers);

        await firstValueFrom(service.submitUser({ name: 'Mario', surname: 'Rossi', username: 'mrossi' }).pipe(take(1)));

        expect(createUserMock).toHaveBeenCalledTimes(1);
        expect(getUsersMock).toHaveBeenCalledTimes(2);
        expect(usersValues.at(-1)).toEqual(secondUsers);

        subscription.unsubscribe();
    });

    it('submitUser aggiorna stato e segnala successo', async () => {
        const dto = { name: 'Mario', surname: 'Rossi', username: 'mrossi' };

        await firstValueFrom(service.submitUser(dto).pipe(take(1)));

        expect(createUserMock).toHaveBeenCalledWith(dto);
        expect(service.createdResponse()?.tempPassword).toBe('TempPass123');
        expect(service.createdUser()).toEqual(dto);
        expect(service.formError()).toBeNull();
    });

    it('submitUser mappa gli errori di conflitto username', async () => {
        createUserMock.mockReturnValueOnce(throwError(() => ({ status: 409 })));

        service.submitUser({ name: 'Mario', surname: 'Rossi', username: 'mrossi' }).subscribe();

        expect(service.formError()).toBe(UserManagementErrorType.USERNAME_ALREADY_IN_USE);
    });

    it('deleteUser triggera refresh dopo il successo', async () => {
        const usersSubscription = service.users$.subscribe();

        await firstValueFrom(service.deleteUser(12).pipe(take(1)));

        expect(deleteUserMock).toHaveBeenCalledWith(12);
        expect(getUsersMock).toHaveBeenCalledTimes(2);

        usersSubscription.unsubscribe();
    });

    it('closeDialog azzera i dati della creazione utente', () => {
        service.createdResponse.set({ tempPassword: 'TempPass123' });
        service.createdUser.set({ name: 'Mario', surname: 'Rossi', username: 'mrossi' });

        service.closeDialog();

        expect(service.createdResponse()).toBeNull();
        expect(service.createdUser()).toBeNull();
    });
});
