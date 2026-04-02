import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { InternalAuthService } from '../../../../core/services/internal-auth.service';
import { AuthErrorType } from '../../models/auth-error-type.enum';
import { UserSession } from '../../models/user-session.model';

export abstract class AuthBaseComponent {
	protected readonly authService = inject(InternalAuthService);
	protected readonly router = inject(Router);
	protected readonly route = inject(ActivatedRoute, { optional: true });

	public errorType: AuthErrorType | null = null;
	public isLoading = false;

	public abstract onUsernameChange(value: string): void;
	public abstract onSubmit(): void;

	protected handleSuccess(session: UserSession): void {
		this.isLoading = false;
		this.errorType = null;

		if (session.isFirstAccess) {
			void this.router.navigate(['/auth/first-access']);
			return;
		}

		const returnUrl = this.route?.snapshot.queryParamMap.get('returnUrl');
		if (returnUrl?.startsWith('/')) {
			void this.router.navigateByUrl(returnUrl);
			return;
		}

		void this.router.navigate(['/apartment-monitor']);
	}

	protected handleError(error: unknown): void {
		this.isLoading = false;

		if (error instanceof HttpErrorResponse) {
			if (error.status === 400 || error.status === 401) {
				this.errorType = AuthErrorType.USERNAME_OR_PASSWORD_WRONG;
				return;
			}

			if (error.status === 409) {
				this.errorType = AuthErrorType.NEW_PASSWORD_EQUALS_TEMP;
				return;
			}
		}

		this.errorType = AuthErrorType.USERNAME_OR_PASSWORD_WRONG;
	}
}
