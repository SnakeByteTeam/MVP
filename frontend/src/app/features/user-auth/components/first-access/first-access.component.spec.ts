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

  it('renderizza il contenuto informativo del primo accesso', () => {
    const content = fixture.nativeElement.textContent as string;

    expect(content).toContain('Primo accesso');
    expect(content).toContain('Imposta la tua password personale');
    expect(content).toContain('password temporanea');
    expect(content).toContain('Conferma e continua');
  });

  it('imposta errore di validazione quando la nuova password coincide con la temporanea', () => {
    component.onUsernameChange('mrossi');
    component.onTempPasswordChange(temporaryCredential);
    component.onNewPasswordChange(temporaryCredential);

    component.onSubmit();

    expect(component.firstAccessForm.errors?.['sameAsTemporaryPassword']).toBe(true);
    expect(authServiceMock.setFirstAccessPassword).not.toHaveBeenCalled();
  });

  it('invia setFirstAccessPassword e naviga su dashboard in caso di successo', () => {
    authServiceMock.setFirstAccessPassword.mockReturnValue(
      of({
        userId: 'u1',
        username: 'mrossi',
        role: 'OPERATORE_SANITARIO',
        accessToken: 'jwt-token',
        isFirstAccess: false,
      })
    );

    component.onUsernameChange('mrossi');
    component.onTempPasswordChange(temporaryCredential);
    component.onNewPasswordChange(nextCredential);
    component.onSubmit();

    expect(authServiceMock.setFirstAccessPassword).toHaveBeenCalledWith(
      'mrossi',
      temporaryCredential,
      nextCredential
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
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

  it('renderizza un messaggio umano quando username o password temporanea sono errati', () => {
    authServiceMock.setFirstAccessPassword.mockReturnValue(throwError(() => new Error('api error')));

    component.onUsernameChange('mrossi');
    component.onTempPasswordChange(temporaryCredential);
    component.onNewPasswordChange(nextCredential);
    component.onSubmit();

    fixture.detectChanges();

    const content = fixture.nativeElement.textContent as string;
    expect(content).toContain('Username o password temporanea errati.');
  });

  it('marca il form touched quando submit su form invalido', () => {
    const markAllAsTouchedSpy = vi.spyOn(component.firstAccessForm, 'markAllAsTouched');

    component.onSubmit();

    expect(markAllAsTouchedSpy).toHaveBeenCalled();
    expect(authServiceMock.setFirstAccessPassword).not.toHaveBeenCalled();
  });

  it('non invia la richiesta quando la nuova password e troppo corta', () => {
    component.onUsernameChange('mrossi');
    component.onTempPasswordChange(temporaryCredential);
    component.onNewPasswordChange('short');
    component.onSubmit();

    expect(component.firstAccessForm.controls.newPassword.errors?.['minlength']).toBeTruthy();
    expect(authServiceMock.setFirstAccessPassword).not.toHaveBeenCalled();
  });

  it('renderizza il messaggio di validazione quando la nuova password coincide con la temporanea', () => {
    component.onUsernameChange('mrossi');
    component.onTempPasswordChange(temporaryCredential);
    component.onNewPasswordChange(temporaryCredential);
    component.onSubmit();

    fixture.detectChanges();

    const content = fixture.nativeElement.textContent as string;
    expect(content).toContain('La nuova password deve essere diversa da quella temporanea.');
  });
});
