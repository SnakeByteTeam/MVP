import { MAIN_LAYOUT_ROUTES } from 'src/app/features/main-layout/main-layout.routes';
import { authGuard } from 'src/app/core/guards/auth.guard';
import { roleGuard } from 'src/app/core/guards/role.guard';
import { UserRole } from 'src/app/core/models/user-role.enum';
import { describe, it, expect } from 'vitest';

describe('Main Layout Routes', () => {

    const rootRoute = MAIN_LAYOUT_ROUTES.find(r => r.path === '');
    const children = rootRoute?.children || [];

    it('carica MainLayoutComponent in modalità lazy', () => {
        expect(rootRoute?.loadComponent).toBeDefined();
        expect(typeof rootRoute?.loadComponent).toBe('function');
    });

    it('dashboard è figlio', () => {
        const dashboard = children.find(c => c.path === 'dashboard');
        expect(dashboard).toBeDefined();
        expect(dashboard?.canActivate).toContain(authGuard);
    });

    describe('Gestione Allarmi (Nested Routes)', () => {
        const alarmsRoute = children.find(c => c.path === 'alarms');

        it('alarms route esiste e ha dei figli', () => {
            expect(alarmsRoute).toBeDefined();
            expect(alarmsRoute?.children).toBeDefined();
        });

        it('configurazione allarmi riservata ad AMMINISTRATORE', () => {
            const config = alarmsRoute?.children?.find(c => c.path === 'alarm-configuration');

            expect(config?.canActivate).toContain(roleGuard);
            expect(config?.data?.['requiredRole']).toBe(UserRole.AMMINISTRATORE);
        });

        it('gestione e storico allarmi richiedono authGuard', () => {
            const mgmt = alarmsRoute?.children?.find(c => c.path === 'alarm-management');
            const history = alarmsRoute?.children?.find(c => c.path === 'alarm-history');

            expect(mgmt?.canActivate).toContain(authGuard);
            expect(history?.canActivate).toContain(authGuard);
        });
    });

    describe('Sicurezza e Ruoli', () => {
        it('routes riservate con roleGuard e ruolo AMMINISTRATORE', () => {
            const sensitivePaths = ['ward-management', 'user-management'];

            sensitivePaths.forEach(path => {
                const route = children.find(c => c.path === path);
                expect(route?.canActivate).toContain(roleGuard);
                expect(route?.data?.['requiredRole']).toBe(UserRole.AMMINISTRATORE);
            });
        });
    });

    it('wildcard reindirizza a dashboard', () => {
        const wildcard = MAIN_LAYOUT_ROUTES.find(r => r.path === '**');
        expect(wildcard?.redirectTo).toBe('dashboard');
    });
});