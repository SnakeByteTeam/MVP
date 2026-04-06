import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/models/user-role.enum';
import { VIMAR_CLOUD_API_SERVICE } from '../../core/services/vimar-cloud-api.service.interface';
import { MyVimarCloudApiFeatureService } from '../my-vimar-integration/services/my-vimar-cloud-api-feature.service';

export const MAIN_LAYOUT_ROUTES: Routes = [
    {
        path: '',
        providers: [
            MyVimarCloudApiFeatureService,
            { provide: VIMAR_CLOUD_API_SERVICE, useExisting: MyVimarCloudApiFeatureService },
        ],
        loadComponent: () => import('./main-layout.component').then((m) => m.MainLayoutComponent),
        children: [
            {
                path: 'dashboard',
                data: { breadcrumb: 'Dashboard' },
                loadChildren: () => import('../dashboard/dashboard-page.routes').then((m) => m.DASHBOARD_ROUTES)
            },
            {
                path: 'alarms',
                children: [
                    {
                        path: 'alarm-management',
                        data: { breadcrumb: 'Gestione allarmi' },
                        canActivate: [authGuard],
                        loadChildren: () => import('../alarm-management/alarm-management.routes').then((m) => m.ALARM_MANAGEMENT_ROUTES)
                    },
                    {
                        path: 'alarm-history',
                        data: { breadcrumb: 'Storico allarmi' },
                        canActivate: [authGuard],
                        loadChildren: () => import('../alarm-history/alarm-history.routes').then((m) => m.ALARM_HISTORY_ROUTES)
                    },
                    {
                        path: 'alarm-configuration',
                        canActivate: [authGuard, roleGuard],
                        data: { requiredRole: UserRole.AMMINISTRATORE, breadcrumb: 'Configurazione allarmi' },
                        loadChildren: () => import('../alarm-configuration/alarm-configuration.routes').then((m) => m.ALARM_CONFIGURATION_ROUTES)
                    },
                ]
            },
            {
                path: 'analytics',
                data: { breadcrumb: 'Analytics' },
                canActivate: [authGuard],
                loadChildren: () => import('../analytics/analytics.routes').then((m) => m.ANALYTICS_ROUTES)
            },
            {
                path: 'apartment-monitor',
                data: { breadcrumb: 'Monitor appartamenti' },
                canActivate: [authGuard],
                loadChildren: () => import('../apartment-monitor/apartment-monitor.routes').then((m) => m.APARTMENT_MONITOR_ROUTES)
            },
            {
                path: 'device-interaction',
                canActivate: [authGuard],
                loadChildren: () =>
                    import('../device-interaction/device-interaction.routes').then((m) => m.DEVICE_INTERACTION_ROUTES)
            },
            {
                path: 'notifications',
                data: { breadcrumb: 'Notifiche' },
                canActivate: [authGuard],
                loadChildren: () => import('../notification/notification.routes').then((m) => m.NOTIFICATION_ROUTES)
            },
            {
                path: 'ward-management',
                data: { requiredRole: UserRole.AMMINISTRATORE, breadcrumb: 'Gestione reparti' },
                canActivate: [authGuard, roleGuard],
                loadChildren: () => import('../ward-management/ward-management.routes').then((m) => m.WARD_MANAGEMENT_ROUTES)
            },
            {
                path: 'user-management',
                data: { requiredRole: UserRole.AMMINISTRATORE, breadcrumb: 'Gestione utenti' },
                canActivate: [authGuard, roleGuard],
                loadChildren: () => import('../user-management/user-management.routes').then((m) => m.USER_MANAGEMENT_ROUTES)
            },
            { path: '**', redirectTo: 'dashboard' }
        ]
    },
    { path: '**', redirectTo: 'dashboard' }
];