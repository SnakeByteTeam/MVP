import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { UserRole } from '../models/user-role.enum';
import { InternalAuthService } from '../services/internal-auth.service';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  const routerMock = {
    createUrlTree: vi.fn(),
  };

  const authServiceMock = {
    hasRole: vi.fn(),
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

  it('restituisce true quando la rotta non richiede ruolo', () => {
    const route = { data: {} } as never;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as never));

    expect(result).toBe(true);
    expect(authServiceMock.hasRole).not.toHaveBeenCalled();
  });

  it('restituisce true quando il ruolo richiesto e presente', () => {
    authServiceMock.hasRole.mockReturnValue(true);
    const route = { data: { requiredRole: UserRole.AMMINISTRATORE } } as never;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as never));

    expect(authServiceMock.hasRole).toHaveBeenCalledWith(UserRole.AMMINISTRATORE);
    expect(result).toBe(true);
  });

  it('redirect su apartment-monitor quando il ruolo richiesto manca', () => {
    authServiceMock.hasRole.mockReturnValue(false);
    const route = { data: { requiredRole: UserRole.AMMINISTRATORE } } as never;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as never));

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/apartment-monitor']);
    expect(result).toEqual({ redirected: true });
  });
});
