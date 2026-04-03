import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InternalAuthService } from '../../../../core/services/internal-auth.service';
import { UserRole } from '../../../../core/models/user-role.enum';
import { AuthErrorType } from '../../models/auth-error-type.enum';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  const userCredential = 'test-credential';

  const routerMock = {
    navigate: vi.fn().mockResolvedValue(true),
    navigateByUrl: vi.fn().mockResolvedValue(true),
  };

  const activatedRouteMock = {
    snapshot: {
      queryParamMap: {
        get: vi.fn().mockReturnValue(null),
      },
    },
  };

  const authServiceMock = {
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
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: InternalAuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('crea il componente', () => {
    expect(component).toBeTruthy();
  });

  it('non invoca login se il form e invalido', () => {
    component.onSubmit();

    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('invoca login e naviga su apartment-monitor se autenticazione ok', () => {
    authServiceMock.login.mockReturnValue(
      of({
        userId: 'u1',
        username: 'mrossi',
        role: UserRole.OPERATORE_SANITARIO,
        accessToken: 'jwt-token',
        isFirstAccess: false,
      })
    );

    component.onUsernameChange('mrossi');
    component.onPasswordChange(userCredential);
    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith('mrossi', userCredential);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/apartment-monitor']);
    expect(component.errorType).toBeNull();
    expect(component.isLoading).toBe(false);
  });

  it('invoca login e naviga su returnUrl se presente', () => {
    activatedRouteMock.snapshot.queryParamMap.get.mockReturnValue('/vimar-link');
    authServiceMock.login.mockReturnValue(
      of({
        userId: 'u1',
        username: 'mrossi',
        role: UserRole.OPERATORE_SANITARIO,
        accessToken: 'jwt-token',
        isFirstAccess: false,
      })
    );

    component.onUsernameChange('mrossi');
    component.onPasswordChange(userCredential);
    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith('mrossi', userCredential);
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/vimar-link');
  });

  it('imposta errore USERNAME_OR_PASSWORD_WRONG su 401', () => {
    authServiceMock.login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }))
    );

    component.onUsernameChange('mrossi');
    component.onPasswordChange(userCredential);
    component.onSubmit();

    expect(component.errorType).toBe(AuthErrorType.USERNAME_OR_PASSWORD_WRONG);
    expect(component.isLoading).toBe(false);
  });

  it('renderizza il testo errore quando errorType e valorizzato', () => {
    authServiceMock.login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }))
    );

    component.onUsernameChange('mrossi');
    component.onPasswordChange(userCredential);
    component.onSubmit();

    fixture.detectChanges();

    const content = fixture.nativeElement.textContent as string;
    expect(content).toContain(AuthErrorType.USERNAME_OR_PASSWORD_WRONG);
  });
});
