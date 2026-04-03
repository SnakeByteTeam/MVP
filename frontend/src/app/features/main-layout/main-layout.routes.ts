import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/models/user-role.enum';
import { VIMAR_CLOUD_API_SERVICE } from '../../core/services/vimar-cloud-api.service.interface';
import { MyVimarCloudApiFeatureService } from '../my-vimar-integration/services/my-vimar-cloud-api-feature.service';

//guardie commentate solo per vedere il funzionamento

export const MAIN_LAYOUT_ROUTES: Routes = [
    {
        path: '',
        providers: [
            MyVimarCloudApiFeatureService,
            {
                provide: VIMAR_CLOUD_API_SERVICE,
                useExisting: MyVimarCloudApiFeatureService,
            },
        ],
        //canActivate: [authGuard],	// DA DECOMMENTARE
        loadComponent: () => import('./main-layout.component').then((m) => m.MainLayoutComponent),
        children: [
            {
                path: 'dashboard',
                //canActivate: [authGuard], // DA DECOMMENTARE
                loadChildren: () => import('../dashboard/dashboard-page.routes').then((m) => m.DASHBOARD_ROUTES)
            },
            {
                path: 'alarms',
                children: [
                    {
                        path: 'alarm-management',
                        canActivate: [authGuard],
                        loadChildren: () =>
                            import('../alarm-management/alarm-management.routes').then((m) => m.ALARM_MANAGEMENT_ROUTES)
                    },
                    {
                        path: 'alarm-history',
                        canActivate: [authGuard],
                        loadChildren: () =>
                            import('../alarm-history/alarm-history.routes').then((m) => m.ALARM_HISTORY_ROUTES)
                    },

                    {
                        path: 'alarm-configuration',
                        canActivate: [authGuard, roleGuard],
                        data: { requiredRole: UserRole.AMMINISTRATORE },
                        loadChildren: () =>
                            import('../alarm-configuration/alarm-configuration.routes').then((m) => m.ALARM_CONFIGURATION_ROUTES)
                    },
                ]
            },

            {
                path: 'analytics',
                //canActivate: [authGuard],
                loadChildren: () => import('../analytics/analytics.routes').then((m) => m.ANALYTICS_ROUTES)
            },
            {
                path: 'apartment-monitor',
                canActivate: [authGuard],
                loadChildren: () =>
                    import('../apartment-monitor/apartment-monitor.routes').then((m) => m.APARTMENT_MONITOR_ROUTES)
            },
            {
                path: 'notifications',
                canActivate: [authGuard],
                loadChildren: () => import('../notification/notification.routes').then((m) => m.NOTIFICATION_ROUTES)
            },
            {
                path: 'ward-management',
                canActivate: [authGuard, roleGuard],
                data: { requiredRole: UserRole.AMMINISTRATORE },
                loadChildren: () =>
                    import('../ward-management/ward-management.routes').then((m) => m.WARD_MANAGEMENT_ROUTES)
            },
            {
                path: 'user-management',
                canActivate: [authGuard, roleGuard],
                data: { requiredRole: UserRole.AMMINISTRATORE },
                loadChildren: () =>
                    import('../user-management/user-management.routes').then((m) => m.USER_MANAGEMENT_ROUTES)
            },
            {
                path: '**',
                redirectTo: 'dashboard'
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];