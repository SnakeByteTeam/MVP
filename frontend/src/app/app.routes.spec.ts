import { routes } from './app.routes';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user-role.enum';
import { describe, it, expect } from 'vitest';

describe('App Routes', () => {
	it('auth route configurata con lazy loading', () => {
		const route = routes.find(r => r.path === 'auth');
		expect(route).toBeDefined();
		expect(route?.loadChildren).toBeDefined();
		expect(typeof route?.loadChildren).toBe('function');
	});

	it('vimar-link route protetta da authGuard e roleGuard', () => {
		const route = routes.find(r => r.path === 'vimar-link');
		expect(route?.canActivate).toContain(authGuard);
		expect(route?.canActivate).toContain(roleGuard);
	});

	it('vimar-link route richiede ruolo AMMINISTRATORE', () => {
		const route = routes.find(r => r.path === 'vimar-link');
		expect(route?.data?.['requiredRole']).toBe(UserRole.AMMINISTRATORE);
	});

	it('route "" carica il main layout', () => {
		const route = routes.find(r => r.path === '');
		expect(route).toBeDefined();
		expect(route?.canActivate).toContain(authGuard);
		expect(route?.loadChildren).toBeDefined();
	});

	it('route "**" fa redirect alla root', () => {
		const wildcardRoute = routes.find(r => r.path === '**');

		expect(wildcardRoute).toBeDefined();
		expect(wildcardRoute?.redirectTo).toBe('');
	});
});