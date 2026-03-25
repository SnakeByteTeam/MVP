import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ALARM_HISTORY_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/alarm-history-page.component').then(
        (m) => m.alarmHistoryComponent
      )
  }
];