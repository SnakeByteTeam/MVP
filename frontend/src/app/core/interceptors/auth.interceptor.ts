import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';
import { InternalAuthService } from '../../features/user-auth/services/internal-auth.service';

let refreshInFlight$: Observable<string> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const authService = inject(InternalAuthService);
	const token = authService.getToken();

	const request = token && shouldAttachAuthHeader(req.url) ? withAuthorization(req, token) : req;

	return next(request).pipe(
		catchError((error: unknown) => {
			if (!(error instanceof HttpErrorResponse) ||
				error.status !== 401 ||
				shouldSkipRefresh(req.url)
			) {
				return throwError(() => error);
			}

			refreshInFlight$ ??= authService.refreshAccessToken().pipe(
				shareReplay(1),
				finalize(() => {
					refreshInFlight$ = null;
				})
			);

			return refreshInFlight$.pipe(
				switchMap((newToken) => next(withAuthorization(req, newToken))),
				catchError((refreshError: unknown) => {
					authService.logout();
					return throwError(() => refreshError);
				})
			);
		})
	);
};

function withAuthorization(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
	return req.clone({
		setHeaders: {
			Authorization: `Bearer ${token}`,
		},
	});
}


function shouldAttachAuthHeader(url: string): boolean {
	return !/\/auth\/(login|refresh|logout)/.test(url);
}

function shouldSkipRefresh(url: string): boolean {
	return /\/auth\/(login|refresh|first-login|logout)/.test(url);
}