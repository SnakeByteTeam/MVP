import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { authGuard } from '../../core/guards/auth.guard';

export const USER_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./components/user-management-page/user-management-page.component').then(
        (m) => m.UserManagementPageComponent
      )
  }
];
