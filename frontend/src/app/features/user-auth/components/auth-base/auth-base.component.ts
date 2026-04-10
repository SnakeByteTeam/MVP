import { inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { InternalAuthService } from '../../services/internal-auth.service';
import { AuthErrorType } from '../../models/auth-error-type.enum';
import { UserSession } from '../../models/user-session.model';

export abstract class AuthBaseComponent {
	protected readonly authService = inject(InternalAuthService);
	protected readonly router = inject(Router);
	protected readonly route = inject(ActivatedRoute, { optional: true });
	private readonly errorTypeState = signal<AuthErrorType | null>(null);
	private readonly isLoadingState = signal(false);

	public get errorType(): AuthErrorType | null {
		return this.errorTypeState();
	}

	public set errorType(value: AuthErrorType | null) {
		this.errorTypeState.set(value);
	}

	public get isLoading(): boolean {
		return this.isLoadingState();
	}

	public set isLoading(value: boolean) {
		this.isLoadingState.set(value);
	}

	public get loginErrorMessage(): string | null {
		switch (this.errorType) {
			case AuthErrorType.USERNAME_OR_PASSWORD_WRONG:
				return 'Utente non trovato: username o password errati.';
			case AuthErrorType.NEW_PASSWORD_EQUALS_TEMP:
				return 'La nuova password deve essere diversa da quella temporanea.';
			case AuthErrorType.USERNAME_OR_TEMP_PASSWORD_WRONG:
				return 'Username o password temporanea errati.';
			case AuthErrorType.NEW_PASSWORD_NOT_VALID:
				return 'La nuova password non e valida.';
			default:
				return null;
		}
	}

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

		void this.router.navigate(['/dashboard']);
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
