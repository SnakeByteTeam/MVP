import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user-role.enum';

export const routes: Routes = [
	{
		path: 'auth',
		loadChildren: () => import('./features/user-auth/user-auth.routes').then((m) => m.USER_AUTH_ROUTES)
	},
	{
		path: 'vimar-link',
		canActivate: [authGuard, roleGuard],
		data: { requiredRole: UserRole.AMMINISTRATORE },
		loadChildren: () =>
			import('./features/my-vimar-integration/my-vimar-integration.routes').then((m) => m.MY_VIMAR_INTEGRATION_ROUTES)
	},
	{
		path: '',
		//canActivate: [authGuard],
		loadChildren: () =>
			import('./features/main-layout/main-layout.routes').then((m) => m.MAIN_LAYOUT_ROUTES)
	},
	{
		path: '**',
		redirectTo: ''
	}
];
