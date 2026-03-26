import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: 'auth',
		loadChildren: () => import('./features/user-auth/user-auth.routes').then((m) => m.USER_AUTH_ROUTES)
	},
	{
		path: 'alarm-management',
		loadChildren: () =>
			import('./features/alarm-management/alarm-management.routes').then((m) => m.ALARM_MANAGEMENT_ROUTES)
	},
	{
		path: 'alarm-configuration',
		loadChildren: () =>
			import('./features/alarm-configuration/alarm-configuration.routes').then((m) => m.ALARM_CONFIGURATION_ROUTES)
	},
	{
		path: 'analytics',
		loadChildren: () => import('./features/analytics/analytics.routes').then((m) => m.ANALYTICS_ROUTES)
	},
	{
		path: 'apartment-monitor',
		loadChildren: () =>
			import('./features/apartment-monitor/apartment-monitor.routes').then((m) => m.APARTMENT_MONITOR_ROUTES)
	},
	{
		path: 'device-interaction',
		loadChildren: () =>
			import('./features/device-interaction/device-interaction.routes').then((m) => m.DEVICE_INTERACTION_ROUTES)
	},
	{
		path: 'my-vimar',
		loadChildren: () =>
			import('./features/my-vimar-integration/my-vimar-integration.routes').then((m) => m.MY_VIMAR_INTEGRATION_ROUTES)
	},
	{
		path: 'notifications',
		loadChildren: () => import('./features/notification/notification.routes').then((m) => m.NOTIFICATION_ROUTES)
	},
	{
		path: 'plant-management',
		loadChildren: () =>
			import('./features/plant-management/plant-management.routes').then((m) => m.PLANT_MANAGEMENT_ROUTES)
	},
	{
		path: 'user-management',
		loadChildren: () =>
			import('./features/user-management/user-management.routes').then((m) => m.USER_MANAGEMENT_ROUTES)
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'apartment-monitor'
	},
	{
		path: '**',
		redirectTo: 'apartment-monitor'
	}
];
