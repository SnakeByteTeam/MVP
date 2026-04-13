import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { InternalAuthService } from 'src/app/core/services/internal-auth.service';
import { authGuard } from 'src/app/core/guards/auth.guard';

describe('authGuard', () => {
  const routerMock = {
    createUrlTree: vi.fn(),
  };

  const authServiceMock = {
    isAuthenticated: vi.fn(),
    restoreSessionFromRefresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    routerMock.createUrlTree.mockReturnValue({ redirected: true });

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: InternalAuthService, useValue: authServiceMock },
      ],
    });
  });

  it('restituisce true quando l utente e autenticato', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(true);
    expect(authServiceMock.restoreSessionFromRefresh).not.toHaveBeenCalled();
    expect(routerMock.createUrlTree).not.toHaveBeenCalled();
  });

  it('consente accesso quando restore sessione riesce', async () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    authServiceMock.restoreSessionFromRefresh.mockReturnValue(of(true));

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(await firstValueFrom(result as ReturnType<typeof of>)).toBe(true);
    expect(routerMock.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirect su /auth/login quando restore sessione fallisce', async () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    authServiceMock.restoreSessionFromRefresh.mockReturnValue(of(false));

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/vimar-link' } as never)
    );

    expect(await firstValueFrom(result as ReturnType<typeof of>)).toEqual({ redirected: true });
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/vimar-link' },
    });
  });
});
