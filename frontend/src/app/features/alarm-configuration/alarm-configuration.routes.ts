import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { AlarmConfigStateService } from './services/alarm-config-state.service';

export const ALARM_CONFIGURATION_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    providers: [AlarmConfigStateService],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/alarm-config-page/alarm-config-page.component').then((m) => m.AlarmConfigPageComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./components/alarm-config-form/alarm-config-form.component').then((m) => m.AlarmConfigFormComponent),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./components/alarm-config-form/alarm-config-form.component').then((m) => m.AlarmConfigFormComponent),
      },
    ],
  }
];
