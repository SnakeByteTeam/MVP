import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserManagementPageComponent } from './user-management-page.component';
import { API_BASE_URL } from '../../../../core/tokens/api-base-url.token';
import { UserApiService } from '../../../../core/services/user-api.service';
import { UserRole } from '../../../../core/models/user-role.enum';
import { UserManagementErrorType } from '../../models/user-management-error-type.enum';

describe('UserManagementPage', () => {
    let component: UserManagementPageComponent;
    let fixture: ComponentFixture<UserManagementPageComponent>;

    const getUsersMock = vi.fn();
    const createUserMock = vi.fn();
    const deleteUserMock = vi.fn();

    beforeEach(async () => {
        vi.clearAllMocks();

        getUsersMock.mockReturnValue(of([]));
        createUserMock.mockReturnValue(
            of({
                user: {
                    id: 1,
                    firstName: 'Mario',
                    lastName: 'Rossi',
                    username: 'mrossi',
                    role: UserRole.OPERATORE_SANITARIO,
                },
                temporaryPassword: 'TempPass123',
            }),
        );
        deleteUserMock.mockReturnValue(of(undefined));

        await TestBed.configureTestingModule({
            imports: [UserManagementPageComponent],
            providers: [
                { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
                {
                    provide: UserApiService,
                    useValue: {
                        getUsers: getUsersMock,
                        createUser: createUserMock,
                        deleteUser: deleteUserMock,
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(UserManagementPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(getUsersMock).toHaveBeenCalledTimes(1);
    });

    it('onFormSubmit in successo imposta createdResponse e triggera refresh lista', () => {
        component.onFormSubmit({
            firstName: 'Mario',
            lastName: 'Rossi',
            username: 'mrossi',
        });

        expect(createUserMock).toHaveBeenCalledWith({
            firstName: 'Mario',
            lastName: 'Rossi',
            username: 'mrossi',
        });
        expect(component.createdResponse()?.user.id).toBe(1);
        expect(component.formError()).toBeNull();
        expect(getUsersMock).toHaveBeenCalledTimes(2);
    });

    it('onFormSubmit con 409 imposta USERNAME_ALREADY_IN_USE', () => {
        createUserMock.mockReturnValueOnce(throwError(() => ({ status: 409 })));

        component.onFormSubmit({
            firstName: 'Mario',
            lastName: 'Rossi',
            username: 'mrossi',
        });

        expect(component.formError()).toBe(UserManagementErrorType.USERNAME_ALREADY_IN_USE);
    });

    it('onFormSubmit con errore generico imposta OTHER_ERROR', () => {
        createUserMock.mockReturnValueOnce(throwError(() => ({ status: 500 })));

        component.onFormSubmit({
            firstName: 'Mario',
            lastName: 'Rossi',
            username: 'mrossi',
        });

        expect(component.formError()).toBe(UserManagementErrorType.OTHER_ERROR);
    });

    it('onUserDeleted delega al service e triggera refresh lista', () => {
        component.onUserDeleted(1);

        expect(deleteUserMock).toHaveBeenCalledWith(1);
        expect(getUsersMock).toHaveBeenCalledTimes(2);
    });

    it('onDialogClosed azzera createdResponse', () => {
        component.createdResponse.set({
            user: {
                id: 1,
                firstName: 'Mario',
                lastName: 'Rossi',
                username: 'mrossi',
                role: UserRole.OPERATORE_SANITARIO,
            },
            temporaryPassword: 'TempPass123',
        });

        component.onDialogClosed();

        expect(component.createdResponse()).toBeNull();
    });

    it('users$ ritorna [] se il caricamento utenti fallisce', async () => {
        getUsersMock.mockReset();
        getUsersMock.mockReturnValue(throwError(() => new Error('boom')));

        const localFixture = TestBed.createComponent(UserManagementPageComponent);
        const localComponent = localFixture.componentInstance;
        localFixture.detectChanges();

        const users = await firstValueFrom(localComponent.users$);

        expect(users).toEqual([]);
    });
});
