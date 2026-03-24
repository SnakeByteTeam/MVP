import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';

describe('app.routes', () => {
  it('contiene i redirect principali attesi', () => {
    const defaultRedirect = routes.find((route) => route.path === '');
    const wildcardRedirect = routes.find((route) => route.path === '**');

    expect(defaultRedirect?.redirectTo).toBe('apartment-monitor');
    expect(defaultRedirect?.pathMatch).toBe('full');

    expect(wildcardRedirect?.redirectTo).toBe('apartment-monitor');
  });

  it('espone il lazy loading per tutte le feature principali', () => {
    const lazyPaths = routes
      .filter((route) => typeof route.loadChildren === 'function')
      .map((route) => route.path);

    expect(lazyPaths).toEqual([
      'auth',
      'alarm-management',
      'alarm-configuration',
      'analytics',
      'apartment-monitor',
      'device-interaction',
      'vimar-link',
      'notifications',
      'plant-management',
      'user-management',
    ]);
  });

  it('risolve correttamente ogni loadChildren verso un array di route', async () => {
    const lazyRoutes = routes.filter(
      (route): route is (typeof routes)[number] & { loadChildren: () => Promise<unknown> } =>
        typeof route.loadChildren === 'function'
    );

    for (const route of lazyRoutes) {
      const loaded = await route.loadChildren();
      expect(Array.isArray(loaded)).toBe(true);
      expect((loaded as unknown[]).length).toBeGreaterThan(0);
    }
  });
});
