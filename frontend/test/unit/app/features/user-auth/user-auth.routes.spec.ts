import { describe, expect, it } from 'vitest';
import { USER_AUTH_ROUTES } from 'src/app/features/user-auth/user-auth.routes';

describe('user-auth.routes', () => {
  it('espone i path login e first-access con lazy load dei componenti', async () => {
    const loginRoute = USER_AUTH_ROUTES.find((route) => route.path === 'login');
    const firstAccessRoute = USER_AUTH_ROUTES.find((route) => route.path === 'first-access');

    expect(typeof loginRoute?.loadComponent).toBe('function');
    expect(typeof firstAccessRoute?.loadComponent).toBe('function');

    const loginComponent = await loginRoute?.loadComponent?.();
    const firstAccessComponent = await firstAccessRoute?.loadComponent?.();

    expect(loginComponent).toBeDefined();
    expect(firstAccessComponent).toBeDefined();
  });

  it('contiene redirect di default verso login', () => {
    const defaultRedirect = USER_AUTH_ROUTES.find((route) => route.path === '');

    expect(defaultRedirect?.pathMatch).toBe('full');
    expect(defaultRedirect?.redirectTo).toBe('login');
  });
});
