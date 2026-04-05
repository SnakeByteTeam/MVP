import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const DASHBOARD_ROUTES : Routes = [
    {
    path: '',
    //canActivate: [authGuard],
    loadComponent: () => import('./components/dashboard-page/dashboard-page.component').then((m) => m.dashboardComponent)
    },
];