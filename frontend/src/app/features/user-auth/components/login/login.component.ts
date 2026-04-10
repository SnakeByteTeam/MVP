import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { AuthBaseComponent } from '../auth-base/auth-base.component';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent extends AuthBaseComponent {
    private readonly fb = inject(FormBuilder);

    public readonly loginForm = this.fb.nonNullable.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.minLength(12)]],
    });

    public override onUsernameChange(value: string): void {
        this.loginForm.controls.username.setValue(value);
    }

    public onPasswordChange(value: string): void {
        this.loginForm.controls.password.setValue(value);
    }

    public override onSubmit(): void {
        this.syncAutofilledCredentialsFromDom();

        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorType = null;

        const { username, password } = this.loginForm.getRawValue();

        this.authService.login(username, password).subscribe({
            next: (session) => {
                this.isLoading = false;
                this.handleSuccess(session);
            },
            error: (error) => this.handleError(error),
        });
    }

    private syncAutofilledCredentialsFromDom(): void {
        if (typeof document === 'undefined') {
            return;
        }

        const usernameControl = this.loginForm.controls.username;
        const passwordControl = this.loginForm.controls.password;

        if (!usernameControl.value) {
            const usernameInput = document.getElementById('username') as HTMLInputElement | null;
            if (usernameInput?.value) {
                usernameControl.setValue(usernameInput.value);
            }
        }

        if (!passwordControl.value) {
            const passwordInput = document.getElementById('password') as HTMLInputElement | null;
            if (passwordInput?.value) {
                passwordControl.setValue(passwordInput.value);
            }
        }
    }
}
