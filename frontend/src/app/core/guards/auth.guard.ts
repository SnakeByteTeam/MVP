import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { InternalAuthService } from '../../features/user-auth/services/internal-auth.service';

export const authGuard: CanActivateFn = (_, state) => {
	const authService = inject(InternalAuthService);
	const router = inject(Router);

	if (authService.isAuthenticated()) {
		return true;
	}

	return authService.restoreSessionFromRefresh().pipe(
		map((restored) =>
			restored
				? true
				: router.createUrlTree(['/auth/login'], {
						queryParams: { returnUrl: state.url },
					})
		)
	);
};
