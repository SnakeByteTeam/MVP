import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { InternalAuthService } from '../services/internal-auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const routerMock = {
    createUrlTree: vi.fn(),
  };

  const authServiceMock = {
    isAuthenticated: vi.fn(),
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
    expect(routerMock.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirect su /auth/login quando non autenticato', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    expect(result).toEqual({ redirected: true });
  });
});
