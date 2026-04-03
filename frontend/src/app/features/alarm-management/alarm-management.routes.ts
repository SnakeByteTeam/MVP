import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ALARM_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/alarm-page-management-component/alarm-page-management-component').then(
        (m) => m.AlarmPageManagementComponent
      )
  }
];
