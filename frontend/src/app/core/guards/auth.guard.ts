import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { InternalAuthService } from '../services/internal-auth.service';

export const authGuard: CanActivateFn = () => {
	const authService = inject(InternalAuthService);
	const router = inject(Router);

	return authService.isAuthenticated() ? true : router.createUrlTree(['/auth/login']);
};
