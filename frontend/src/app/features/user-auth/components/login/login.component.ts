import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { AuthBaseComponent } from '../auth-base/auth-base.component';

@Component({
	selector: 'app-login',
	imports: [ReactiveFormsModule],
	template: `
		<form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
			<input
				type="text"
				formControlName="username"
				(input)="onUsernameChange($any($event.target).value)"
				placeholder="Username"
			/>
			<input
				type="password"
				formControlName="password"
				(input)="onPasswordChange($any($event.target).value)"
				placeholder="Password"
			/>

			<button type="submit" [disabled]="isLoading">Accedi</button>

			@if (errorType) {
				<p>{{ errorType }}</p>
			}
		</form>
	`,
})
export class LoginComponent extends AuthBaseComponent implements OnInit {
	private readonly fb = inject(FormBuilder);

	public loginForm!: FormGroup;

	public ngOnInit(): void {
		this.loginForm = this.fb.nonNullable.group({
			username: ['', [Validators.required]],
			password: ['', [Validators.required]],
		});
	}

	public override onUsernameChange(value: string): void {
		this.loginForm.controls['username'].setValue(value);
	}

	public onPasswordChange(value: string): void {
		this.loginForm.controls['password'].setValue(value);
	}

	public override onSubmit(): void {
		if (this.loginForm.invalid) {
			this.loginForm.markAllAsTouched();
			return;
		}

		const username = this.loginForm.controls['username'].value as string;
		const password = this.loginForm.controls['password'].value as string;

		this.isLoading = true;
		this.errorType = null;

		this.authService.login(username, password).subscribe({
			next: (session) => this.handleSuccess(session),
			error: (error) => this.handleError(error),
		});
	}
}
