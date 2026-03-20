import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { authGuard } from '../../core/guards/auth.guard';
import { AssignmentOperationsService } from './services/assignment-operations.service';
import { PlantManagementStore } from './services/plant-management.store';
import { WardOperationsService } from './services/ward-operations.service';
import { WardStore } from './services/ward.store';

export const PLANT_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, adminGuard],
    providers: [WardStore, WardOperationsService, AssignmentOperationsService, PlantManagementStore],
    loadComponent: () =>
      import('./components/plant-management-page-component/plant-management-page-component').then((m) => m.PlantManagementPageComponent)
  }
];
