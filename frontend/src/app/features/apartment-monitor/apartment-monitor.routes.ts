import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const APARTMENT_MONITOR_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/apartment-monitor/apartment-monitor.component').then((m) => m.ApartmentMonitorComponent)
  }
];
