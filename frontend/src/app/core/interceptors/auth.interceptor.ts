import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { InternalAuthService } from '../services/internal-auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const authService = inject(InternalAuthService);
	const token = authService.getToken();

	if (!token) {
		return next(req);
	}

	return next(
		req.clone({
			setHeaders: {
				Authorization: `Bearer ${token}`,
			},
		})
	);
};
