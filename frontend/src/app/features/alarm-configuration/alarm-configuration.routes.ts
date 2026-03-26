import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ALARM_CONFIGURATION_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/alarm-config-page/alarm-config-page.component').then((m) => m.AlarmConfigPageComponent)
  }
];
