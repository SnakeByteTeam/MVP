import { Routes } from '@angular/router';

export const USER_AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'first-access',
    loadComponent: () => import('./components/first-access/first-access.component').then((m) => m.FirstAccessComponent)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  }
];
