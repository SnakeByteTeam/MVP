import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { authGuard } from '../../core/guards/auth.guard';
import { AssignmentOperationsService } from './services/assignment-operations.service';
import { WardManagementStore } from './services/ward-management.store';
import { WardOperationsService } from './services/ward-operations.service';
import { WardStore } from './services/ward.store';

export const WARD_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    //canActivate: [authGuard, adminGuard],
    providers: [WardStore, WardOperationsService, AssignmentOperationsService, WardManagementStore],
    loadComponent: () =>
      import('./components/ward-management-page-component/ward-management-page-component').then((m) => m.WardManagementPageComponent)
  }
];
