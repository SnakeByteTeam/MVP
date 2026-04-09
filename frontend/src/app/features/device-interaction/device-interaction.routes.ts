import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const DEVICE_INTERACTION_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/room-detail/room-detail.component').then((m) => m.RoomDetailComponent)
  },
  {
    path: ':roomId',
    canActivate: [authGuard],
    loadComponent: () => import('./components/room-detail/room-detail.component').then((m) => m.RoomDetailComponent)
  }
];
