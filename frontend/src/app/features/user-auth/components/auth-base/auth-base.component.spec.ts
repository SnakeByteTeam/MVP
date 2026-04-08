import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InternalAuthService } from '../../../../core/services/internal-auth.service';
import { UserRole } from '../../../../core/models/user-role.enum';
import { AuthErrorType } from '../../models/auth-error-type.enum';
import { UserSession } from '../../models/user-session.model';
import { AuthBaseComponent } from './auth-base.component';

class TestAuthBaseComponent extends AuthBaseComponent {
  public onUsernameChange(): void { }

  public onSubmit(): void { }

  public callHandleSuccess(session: UserSession): void {
    this.handleSuccess(session);
  }

  public callHandleError(error: unknown): void {
    this.handleError(error);
  }
}

describe('AuthBaseComponent', () => {
  let component: TestAuthBaseComponent;

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

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: InternalAuthService, useValue: authServiceMock },
      ],
    });

    component = TestBed.runInInjectionContext(() => new TestAuthBaseComponent());
  });

  it('handleSuccess naviga a first-access quando isFirstAccess e true', () => {
    component.isLoading = true;
    component.errorType = AuthErrorType.USERNAME_OR_PASSWORD_WRONG;

    component.callHandleSuccess({
      userId: 'u1',
      username: 'mrossi',
      role: UserRole.OPERATORE_SANITARIO,
      accessToken: 'jwt',
      isFirstAccess: true,
    });

    expect(component.isLoading).toBe(false);
    expect(component.errorType).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/first-access']);
  });

  it('handleSuccess naviga a dashboard quando isFirstAccess e false', () => {
    component.callHandleSuccess({
      userId: 'u1',
      username: 'mrossi',
      role: UserRole.OPERATORE_SANITARIO,
      accessToken: 'jwt',
      isFirstAccess: false,
    });

    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('handleSuccess naviga su returnUrl quando presente', () => {
    activatedRouteMock.snapshot.queryParamMap.get.mockReturnValue('/vimar-link');

    component.callHandleSuccess({
      userId: 'u1',
      username: 'mrossi',
      role: UserRole.OPERATORE_SANITARIO,
      accessToken: 'jwt',
      isFirstAccess: false,
    });

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/vimar-link');
    expect(routerMock.navigate).not.toHaveBeenCalledWith(['/dashboard']);
  });

  it('handleError imposta USERNAME_OR_PASSWORD_WRONG su 400 e 401', () => {
    component.callHandleError(new HttpErrorResponse({ status: 400 }));
    expect(component.errorType).toBe(AuthErrorType.USERNAME_OR_PASSWORD_WRONG);

    component.callHandleError(new HttpErrorResponse({ status: 401 }));
    expect(component.errorType).toBe(AuthErrorType.USERNAME_OR_PASSWORD_WRONG);
  });

  it('handleError imposta NEW_PASSWORD_EQUALS_TEMP su 409', () => {
    component.callHandleError(new HttpErrorResponse({ status: 409 }));
    expect(component.errorType).toBe(AuthErrorType.NEW_PASSWORD_EQUALS_TEMP);
  });

  it('handleError usa fallback USERNAME_OR_PASSWORD_WRONG per errori non Http', () => {
    component.callHandleError(new Error('generic'));
    expect(component.errorType).toBe(AuthErrorType.USERNAME_OR_PASSWORD_WRONG);
    expect(component.isLoading).toBe(false);
  });
});
