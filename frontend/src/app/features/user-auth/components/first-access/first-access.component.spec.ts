import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InternalAuthService } from '../../../../core/services/internal-auth.service';
import { AuthErrorType } from '../../models/auth-error-type.enum';
import { FirstAccessComponent } from './first-access.component';

describe('FirstAccessComponent', () => {
  let component: FirstAccessComponent;
  let fixture: ComponentFixture<FirstAccessComponent>;
  const temporaryCredential = 'temp-credential';
  const nextCredential = 'next-credential';

  const routerMock = {
    navigate: vi.fn().mockResolvedValue(true),
  };

  const authServiceMock = {
    login: vi.fn(),
    setFirstAccessPassword: vi.fn(),
    getToken: vi.fn(),
    getCurrentUser$: vi.fn(),
    getRole: vi.fn(),
    isAuthenticated: vi.fn(),
    hasRole: vi.fn(),
    logout: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [FirstAccessComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: InternalAuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FirstAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('crea il componente', () => {
    expect(component).toBeTruthy();
  });

  it('non invia la richiesta se nuova password uguale alla temporanea', () => {
    component.onUsernameChange('mrossi');
    component.onTempPasswordChange(temporaryCredential);
    component.onNewPasswordChange(temporaryCredential);
    component.onSubmit();

    expect(authServiceMock.setFirstAccessPassword).not.toHaveBeenCalled();
    expect(component.errorType).toBe(AuthErrorType.NEW_PASSWORD_EQUALS_TEMP);
  });

  it('invia setFirstAccessPassword e naviga su login in caso di successo', () => {
    authServiceMock.setFirstAccessPassword.mockReturnValue(of(undefined));

    component.onUsernameChange('mrossi');
    component.onTempPasswordChange(temporaryCredential);
    component.onNewPasswordChange(nextCredential);
    component.onSubmit();

    expect(authServiceMock.setFirstAccessPassword).toHaveBeenCalledWith(
      'mrossi',
      temporaryCredential,
      nextCredential
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(component.isLoading).toBe(false);
  });

  it('imposta errore USERNAME_OR_TEMP_PASSWORD_WRONG in caso di errore API', () => {
    authServiceMock.setFirstAccessPassword.mockReturnValue(throwError(() => new Error('api error')));

    component.onUsernameChange('mrossi');
    component.onTempPasswordChange(temporaryCredential);
    component.onNewPasswordChange(nextCredential);
    component.onSubmit();

    expect(component.errorType).toBe(AuthErrorType.USERNAME_OR_TEMP_PASSWORD_WRONG);
    expect(component.isLoading).toBe(false);
  });

  it('marca il form touched quando submit su form invalido', () => {
    const markAllAsTouchedSpy = vi.spyOn(component.firstAccessForm, 'markAllAsTouched');

    component.onSubmit();

    expect(markAllAsTouchedSpy).toHaveBeenCalled();
    expect(authServiceMock.setFirstAccessPassword).not.toHaveBeenCalled();
  });

  it('imposta NEW_PASSWORD_NOT_VALID quando la nuova credenziale e troppo corta', () => {
    const newPasswordControl = component.firstAccessForm.controls['newPassword'];
    newPasswordControl.clearValidators();
    newPasswordControl.updateValueAndValidity();

    component.onUsernameChange('mrossi');
    component.onTempPasswordChange(temporaryCredential);
    component.onNewPasswordChange('short');
    component.onSubmit();

    expect(component.errorType).toBe(AuthErrorType.NEW_PASSWORD_NOT_VALID);
    expect(authServiceMock.setFirstAccessPassword).not.toHaveBeenCalled();
  });

  it('renderizza il testo errore quando errorType e valorizzato', () => {
    component.onUsernameChange('mrossi');
    component.onTempPasswordChange(temporaryCredential);
    component.onNewPasswordChange(temporaryCredential);
    component.onSubmit();

    fixture.detectChanges();

    const content = fixture.nativeElement.textContent as string;
    expect(content).toContain(AuthErrorType.NEW_PASSWORD_EQUALS_TEMP);
  });
});
