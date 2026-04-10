import { describe, expect, it } from 'vitest';
import { authGuard } from '../core/guards/auth.guard';
import { adminGuard } from '../core/guards/admin.guard';
import { AlarmConfigStateService } from './alarm-configuration/services/alarm-config-state.service';
import { AssignmentOperationsService } from './ward-management/services/assignment-operations.service';
import { WardManagementStore } from './ward-management/services/ward-management.store';
import { WardOperationsService } from './ward-management/services/ward-operations.service';
import { WardStore } from './ward-management/services/ward.store';
import { MyVimarCloudApiFeatureService } from './my-vimar-integration/services/my-vimar-cloud-api-feature.service';
import { VIMAR_CLOUD_API_SERVICE } from '../core/services/vimar-cloud-api.service.interface';
import { ALARM_CONFIGURATION_ROUTES } from './alarm-configuration/alarm-configuration.routes';
import { ALARM_HISTORY_ROUTES } from './alarm-history/alarm-history.routes';
import { ALARM_MANAGEMENT_ROUTES } from './alarm-management/alarm-management.routes';
import { ANALYTICS_ROUTES } from './analytics/analytics.routes';
import { APARTMENT_MONITOR_ROUTES } from './apartment-monitor/apartment-monitor.routes';
import { DASHBOARD_ROUTES } from './dashboard/dashboard-page.routes';
import { DEVICE_INTERACTION_ROUTES } from './device-interaction/device-interaction.routes';
import { MY_VIMAR_INTEGRATION_ROUTES } from './my-vimar-integration/my-vimar-integration.routes';
import { NOTIFICATION_ROUTES } from './notification/notification.routes';
import { USER_MANAGEMENT_ROUTES } from './user-management/user-management.routes';
import { WARD_MANAGEMENT_ROUTES } from './ward-management/ward-management.routes';

describe('Feature Routes Quick Coverage', () => {
  it('copre alarm-configuration route e lazy component', async () => {
    const route = ALARM_CONFIGURATION_ROUTES[0];
    const child = route.children?.[0];

    expect(route.path).toBe('');
    expect(route.canActivate).toContain(authGuard);
    expect(route.providers).toContain(AlarmConfigStateService);
    expect(typeof child?.loadComponent).toBe('function');

    const loaded = await child?.loadComponent?.();
    expect(loaded).toBeTruthy();
  });

  it('copre alarm-history route e lazy component', async () => {
    const route = ALARM_HISTORY_ROUTES[0];

    expect(route.path).toBe('');
    expect(route.canActivate).toContain(authGuard);
    expect(typeof route.loadComponent).toBe('function');

    const loaded = await route.loadComponent?.();
    expect(loaded).toBeTruthy();
  });

  it('copre alarm-management route e lazy component', async () => {
    const route = ALARM_MANAGEMENT_ROUTES[0];

    expect(route.path).toBe('');
    expect(route.canActivate).toContain(authGuard);
    expect(typeof route.loadComponent).toBe('function');

    const loaded = await route.loadComponent?.();
    expect(loaded).toBeTruthy();
  });

  it('copre analytics route e lazy component', async () => {
    const route = ANALYTICS_ROUTES[0];

    expect(route.path).toBe('');
    expect(typeof route.loadComponent).toBe('function');

    const loaded = await route.loadComponent?.();
    expect(loaded).toBeTruthy();
  });

  it('copre apartment-monitor route e lazy component', async () => {
    const route = APARTMENT_MONITOR_ROUTES[0];

    expect(route.path).toBe('');
    expect(route.canActivate).toContain(authGuard);
    expect(typeof route.loadComponent).toBe('function');

    const loaded = await route.loadComponent?.();
    expect(loaded).toBeTruthy();
  });

  it('copre dashboard route e lazy component', async () => {
    const route = DASHBOARD_ROUTES[0];

    expect(route.path).toBe('');
    expect(typeof route.loadComponent).toBe('function');

    const loaded = await route.loadComponent?.();
    expect(loaded).toBeTruthy();
  });

  it('copre device-interaction routes e lazy component', async () => {
    expect(DEVICE_INTERACTION_ROUTES).toHaveLength(2);

    for (const route of DEVICE_INTERACTION_ROUTES) {
      expect(route.canActivate).toContain(authGuard);
      expect(typeof route.loadComponent).toBe('function');

      const loaded = await route.loadComponent?.();
      expect(loaded).toBeTruthy();
    }
  });

  it('copre my-vimar-integration route, provider binding e lazy component', async () => {
    const route = MY_VIMAR_INTEGRATION_ROUTES[0];
    const providerList = route.providers ?? [];
    const existingProvider = providerList.find(
      (provider) =>
        typeof provider === 'object' &&
        provider !== null &&
        'provide' in provider &&
        provider.provide === VIMAR_CLOUD_API_SERVICE,
    ) as { useExisting?: unknown } | undefined;
    const child = route.children?.[0];

    expect(route.path).toBe('');
    expect(providerList).toContain(MyVimarCloudApiFeatureService);
    expect(existingProvider?.useExisting).toBe(MyVimarCloudApiFeatureService);
    expect(child?.canActivate).toContain(authGuard);
    expect(typeof child?.loadComponent).toBe('function');

    const loaded = await child?.loadComponent?.();
    expect(loaded).toBeTruthy();
  });

  it('copre notification route e lazy component', async () => {
    const route = NOTIFICATION_ROUTES[0];

    expect(route.path).toBe('');
    expect(route.canActivate).toContain(authGuard);
    expect(typeof route.loadComponent).toBe('function');

    const loaded = await route.loadComponent?.();
    expect(loaded).toBeTruthy();
  });

  it('copre user-management route e lazy component', async () => {
    const route = USER_MANAGEMENT_ROUTES[0];

    expect(route.path).toBe('');
    expect(route.canActivate).toContain(authGuard);
    expect(route.canActivate).toContain(adminGuard);
    expect(typeof route.loadComponent).toBe('function');

    const loaded = await route.loadComponent?.();
    expect(loaded).toBeTruthy();
  });

  it('copre ward-management route, providers e lazy component', async () => {
    const route = WARD_MANAGEMENT_ROUTES[0];

    expect(route.path).toBe('');
    expect(route.providers).toContain(WardStore);
    expect(route.providers).toContain(WardOperationsService);
    expect(route.providers).toContain(AssignmentOperationsService);
    expect(route.providers).toContain(WardManagementStore);
    expect(typeof route.loadComponent).toBe('function');

    const loaded = await route.loadComponent?.();
    expect(loaded).toBeTruthy();
  });
});