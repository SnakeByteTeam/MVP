import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { AuthBaseComponent } from '../auth-base/auth-base.component';

@Component({
	selector: 'app-login',
	imports: [ReactiveFormsModule],
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css'],
})
export class LoginComponent extends AuthBaseComponent implements OnInit {
	private readonly fb = inject(FormBuilder);
	@ViewChild('usernameInput') private usernameInput?: ElementRef<HTMLInputElement>;
	@ViewChild('passwordInput') private passwordInput?: ElementRef<HTMLInputElement>;

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
		this.syncBrowserManagedInputs();

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

	private syncBrowserManagedInputs(): void {
		const username = this.usernameInput?.nativeElement.value ?? '';
		const password = this.passwordInput?.nativeElement.value ?? '';

		if (username !== this.loginForm.controls['username'].value) {
			this.loginForm.controls['username'].setValue(username);
		}

		if (password !== this.loginForm.controls['password'].value) {
			this.loginForm.controls['password'].setValue(password);
		}
	}
}
