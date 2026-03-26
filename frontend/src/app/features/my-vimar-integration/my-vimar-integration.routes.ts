import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const MY_VIMAR_INTEGRATION_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/my-vimar/my-vimar-page.component').then((m) => m.MyVimarPageComponent)
  },
  {
    path: 'oauth-callback',
    loadComponent: () => import('./pages/oauth-callback/oauth-callback.component').then((m) => m.OAuthCallbackComponent)
  }
];
