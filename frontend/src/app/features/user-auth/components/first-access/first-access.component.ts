import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthBaseComponent } from '../auth-base/auth-base.component';
import { AuthErrorType } from '../../models/auth-error-type.enum';

function newPasswordDiffersFromTempPassword(): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const tempPassword = control.get('temporaryPassword')?.value as string;
		const newPassword = control.get('newPassword')?.value as string;

		if (!tempPassword || !newPassword) {
			return null;
		}

		return tempPassword === newPassword ? { sameAsTemporaryPassword: true } : null;
	};
}

@Component({
	selector: 'app-first-access',
	imports: [ReactiveFormsModule],
	templateUrl: './first-access.component.html',
	styleUrls: ['./first-access.component.css'],
})
export class FirstAccessComponent extends AuthBaseComponent {
	private readonly fb = inject(FormBuilder);

	public readonly firstAccessForm = this.fb.nonNullable.group(
		{
			username: ['', [Validators.required, Validators.minLength(3)]],
			temporaryPassword: ['', [Validators.required, Validators.minLength(12)]],
			newPassword: ['', [Validators.required, Validators.minLength(12)]],
		},
		{ validators: [newPasswordDiffersFromTempPassword()] }
	);


	public override onUsernameChange(value: string): void {
		this.firstAccessForm.controls.username.setValue(value);
	}

	public onTempPasswordChange(value: string): void {
		this.firstAccessForm.controls.temporaryPassword.setValue(value);
	}

	public onNewPasswordChange(value: string): void {
		this.firstAccessForm.controls.newPassword.setValue(value);
	}

	public override onSubmit(): void {
		if (this.firstAccessForm.invalid) {
			this.firstAccessForm.markAllAsTouched();
			return;
		}

		const { username, temporaryPassword, newPassword } = this.firstAccessForm.getRawValue();

		this.isLoading = true;
		this.errorType = null;

		this.authService.setFirstAccessPassword(username, temporaryPassword, newPassword).subscribe({
			next: (session) => {
				this.handleSuccess(session);
			},
			error: () => {
				this.isLoading = false;
				this.errorType = AuthErrorType.USERNAME_OR_TEMP_PASSWORD_WRONG;
			},
		});
	}

}
