import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { VIMAR_CLOUD_API_SERVICE } from '../../core/services/vimar-cloud-api.service.interface';
import { MyVimarCloudApiFeatureService } from './services/my-vimar-cloud-api-feature.service';

export const MY_VIMAR_INTEGRATION_ROUTES: Routes = [
  {
    path: '',
    providers: [
      MyVimarCloudApiFeatureService,
      {
        provide: VIMAR_CLOUD_API_SERVICE,
        useExisting: MyVimarCloudApiFeatureService,
      },
    ],
    children: [
      {
        path: '',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/my-vimar/my-vimar-page.component').then((m) => m.MyVimarPageComponent),
      },
    ],
  }
];
