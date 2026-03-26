import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { authGuard } from '../../core/guards/auth.guard';

export const PLANT_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./components/plant-management-page/plant-management-page.component').then((m) => m.PlantManagementPageComponent)
  }
];
