import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../../features/user-management/models/user-role.enum';
import { InternalAuthService } from '../../features/user-auth/services/internal-auth.service';

export const roleGuard: CanActivateFn = (route) => {
	const authService = inject(InternalAuthService);
	const router = inject(Router);

	const requiredRole = route.data?.['requiredRole'] as UserRole | undefined;
	if (!requiredRole) {
		return true;
	}

	return authService.hasRole(requiredRole) ? true : router.createUrlTree(['/apartment-monitor']);
};
