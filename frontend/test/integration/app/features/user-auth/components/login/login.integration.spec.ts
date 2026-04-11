import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InternalAuthService } from 'src/app/core/services/internal-auth.service';
import { UserRole } from 'src/app/core/models/user-role.enum';
import { AuthErrorType } from 'src/app/features/user-auth/models/auth-error-type.enum';
import { LoginComponent } from 'src/app/features/user-auth/components/login/login.component';

describe('UserAuth feature integration', () => {
    let fixture: ComponentFixture<LoginComponent>;
    let component: LoginComponent;

    const routerStub = {
        navigate: vi.fn().mockResolvedValue(true),
        navigateByUrl: vi.fn().mockResolvedValue(true),
    };

    const activatedRouteStub = {
        snapshot: {
            queryParamMap: {
                get: vi.fn().mockReturnValue(null),
            },
        },
    };

    const authServiceStub = {
        login: vi.fn(),
        setFirstAccessPassword: vi.fn(),
        getToken: vi.fn(),
        getCurrentUser$: vi.fn(),
        getRole: vi.fn(),
        isAuthenticated: vi.fn(),
        hasRole: vi.fn(),
        logout: vi.fn(),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        await TestBed.configureTestingModule({
            imports: [LoginComponent],
            providers: [
                { provide: Router, useValue: routerStub },
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: InternalAuthService, useValue: authServiceStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('RF1-OBL login valido reindirizza in dashboard', () => {
        authServiceStub.login.mockReturnValue(
            of({
                userId: 'u1',
                username: 'mrossi',
                role: UserRole.OPERATORE_SANITARIO,
                accessToken: 'jwt-token',
                isFirstAccess: false,
            }),
        );

        component.onUsernameChange('mrossi');
        component.onPasswordChange('AdminAccess123');
        component.onSubmit();

        expect(authServiceStub.login).toHaveBeenCalledWith('mrossi', 'AdminAccess123');
        expect(routerStub.navigate).toHaveBeenCalledWith(['/dashboard']);
        expect(component.errorType).toBeNull();
    });

    it('RF2-OBL login invalido espone errore credenziali', () => {
        authServiceStub.login.mockReturnValue(
            throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' })),
        );

        component.onUsernameChange('mrossi');
        component.onPasswordChange('AdminAccess123');
        component.onSubmit();

        expect(component.errorType).toBe(AuthErrorType.USERNAME_OR_PASSWORD_WRONG);
        expect(component.loginErrorMessage).toContain('username o password errati');
    });

    it('RF3-OBL form invalido non invoca autenticazione', () => {
        component.loginForm.controls.username.setValue('ab');
        component.loginForm.controls.password.setValue('short');

        component.onSubmit();

        expect(authServiceStub.login).not.toHaveBeenCalled();
    });
});
