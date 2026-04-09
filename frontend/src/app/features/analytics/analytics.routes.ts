import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    //canActivate: [authGuard],
    loadComponent: () => import('./analytics.component').then((m) => m.AnalyticsComponent)
  }
];
