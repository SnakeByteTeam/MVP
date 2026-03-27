import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const NOTIFICATION_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/notification-page/notification-page.component').then((m) => m.NotificationPageComponent)
  }
];
