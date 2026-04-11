import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { API_BASE_URL } from 'src/app/core/tokens/api-base-url.token';
import { UserApiService } from 'src/app/features/user-management/services/user-api.service';
import { UserManagementErrorType } from 'src/app/features/user-management/models/user-management-error-type.enum';
import { UserManagementPageComponent } from 'src/app/features/user-management/components/user-management-page/user-management-page.component';

describe('UserManagement feature integration', () => {
    let fixture: ComponentFixture<UserManagementPageComponent>;
    let component: UserManagementPageComponent;

    const getUsersStub = vi.fn();
    const createUserStub = vi.fn();
    const deleteUserStub = vi.fn();

    beforeEach(async () => {
        vi.clearAllMocks();

        getUsersStub.mockReturnValue(of([]));
        createUserStub.mockReturnValue(of({ tempPassword: 'TempPass123' }));
        deleteUserStub.mockReturnValue(of(undefined));

        await TestBed.configureTestingModule({
            imports: [UserManagementPageComponent],
            providers: [
                { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
                {
                    provide: UserApiService,
                    useValue: {
                        getUsers: getUsersStub,
                        createUser: createUserStub,
                        deleteUser: deleteUserStub,
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(UserManagementPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('RF16-OBL inizializza pagina e carica elenco utenti', () => {
        expect(component).toBeTruthy();
        expect(getUsersStub).toHaveBeenCalledTimes(1);
        expect(component.isCreateFormOpen()).toBe(false);
    });

    it('RF17-OBL submit creazione utente aggiorna stato e refresha la lista', () => {
        component.onFormSubmit({
            name: 'Mario',
            surname: 'Rossi',
            username: 'mrossi',
        });

        expect(createUserStub).toHaveBeenCalledWith({
            name: 'Mario',
            surname: 'Rossi',
            username: 'mrossi',
        });
        expect(component.createdResponse()?.tempPassword).toBe('TempPass123');
        expect(getUsersStub).toHaveBeenCalledTimes(2);
    });

    it('RF18-OBL errore 409 in creazione espone errore username in uso', () => {
        createUserStub.mockReturnValueOnce(throwError(() => ({ status: 409 })));

        component.onFormSubmit({
            name: 'Mario',
            surname: 'Rossi',
            username: 'mrossi',
        });

        expect(component.formError()).toBe(UserManagementErrorType.USERNAME_ALREADY_IN_USE);
    });
});
