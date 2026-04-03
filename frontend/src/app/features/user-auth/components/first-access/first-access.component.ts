import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { AuthBaseComponent } from '../auth-base/auth-base.component';
import { AuthErrorType } from '../../models/auth-error-type.enum';

@Component({
	selector: 'app-first-access',
	imports: [ReactiveFormsModule],
	templateUrl: './first-access.component.html',
})
export class FirstAccessComponent extends AuthBaseComponent implements OnInit {
	private readonly fb = inject(FormBuilder);

	public firstAccessForm!: FormGroup;

	public ngOnInit(): void {
		this.firstAccessForm = this.fb.nonNullable.group({
			username: ['', [Validators.required]],
			temporaryPassword: ['', [Validators.required]],
			newPassword: ['', [Validators.required, Validators.minLength(8)]],
		});
	}

	public override onUsernameChange(value: string): void {
		this.firstAccessForm.controls['username'].setValue(value);
	}

	public onTempPasswordChange(value: string): void {
		this.firstAccessForm.controls['temporaryPassword'].setValue(value);
	}

	public onNewPasswordChange(value: string): void {
		this.firstAccessForm.controls['newPassword'].setValue(value);
	}

	public override onSubmit(): void {
		if (this.firstAccessForm.invalid) {
			this.firstAccessForm.markAllAsTouched();
			return;
		}

		const username = this.firstAccessForm.controls['username'].value as string;
		const temporaryPassword = this.firstAccessForm.controls['temporaryPassword'].value as string;
		const newPassword = this.firstAccessForm.controls['newPassword'].value as string;

		if (!this.validateNewPassword(newPassword, temporaryPassword)) {
			return;
		}

		this.isLoading = true;
		this.errorType = null;

		this.authService.setFirstAccessPassword(username, temporaryPassword, newPassword).subscribe({
			next: () => {
				this.isLoading = false;
				void this.router.navigate(['/auth/login']);
			},
			error: () => {
				this.isLoading = false;
				this.errorType = AuthErrorType.USERNAME_OR_TEMP_PASSWORD_WRONG;
			},
		});
	}

	private validateNewPassword(newPassword: string, temporaryPassword: string): boolean {
		if (newPassword === temporaryPassword) {
			this.errorType = AuthErrorType.NEW_PASSWORD_EQUALS_TEMP;
			return false;
		}

		if (newPassword.length < 8) {
			this.errorType = AuthErrorType.NEW_PASSWORD_NOT_VALID;
			return false;
		}

		return true;
	}
}
