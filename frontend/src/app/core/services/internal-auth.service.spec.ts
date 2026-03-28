import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it, beforeEach } from 'vitest';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { UserRole } from '../models/user-role.enum';
import { InternalAuthService } from './internal-auth.service';

function toBase64Url(value: string): string {
  return btoa(value).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function createAccessToken(claims: Record<string, unknown>): string {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = toBase64Url(JSON.stringify(claims));
  return `${header}.${payload}.signature`;
}

describe('InternalAuthService', () => {
  let service: InternalAuthService;
  let httpMock: HttpTestingController;
  const loginCredential = 'test-credential';
  const temporaryCredential = 'temp-credential';
  const nextCredential = 'next-credential';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InternalAuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
      ],
    });

    service = TestBed.inject(InternalAuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('esegue login, salva sessione e rende autenticato l utente', async () => {
    const loginPromise = firstValueFrom(service.login('mrossi', loginCredential));

    const request = httpMock.expectOne('http://localhost:3000/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ username: 'mrossi', password: loginCredential });

    const accessToken = createAccessToken({
      userId: 'user-1',
      username: 'mrossi',
      role: UserRole.OPERATORE_SANITARIO,
      isFirstAccess: false,
    });

    request.flush({ accessToken });

    const session = await loginPromise;
    expect(session.username).toBe('mrossi');
    expect(service.getToken()).toBe(accessToken);
    expect(service.getRole()).toBe(UserRole.OPERATORE_SANITARIO);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.hasRole(UserRole.OPERATORE_SANITARIO)).toBe(true);
    expect(service.hasRole(UserRole.AMMINISTRATORE)).toBe(false);
  });

  it('chiama endpoint first-access con payload corretto', async () => {
    const callPromise = firstValueFrom(
      service.setFirstAccessPassword('mrossi', temporaryCredential, nextCredential)
    );

    const request = httpMock.expectOne('http://localhost:3000/auth/first-access');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      username: 'mrossi',
      temporaryPassword: temporaryCredential,
      newPassword: nextCredential,
    });

    request.flush(null);
    await callPromise;
  });

  it('chiama refresh, aggiorna il token e restituisce il nuovo accessToken', async () => {
    const refreshPromise = firstValueFrom(service.refreshAccessToken());

    const request = httpMock.expectOne('http://localhost:3000/auth/refresh');
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual({});

    const accessToken = createAccessToken({
      userId: 'user-1',
      username: 'mrossi',
      role: UserRole.OPERATORE_SANITARIO,
      isFirstAccess: false,
    });
    request.flush({ accessToken });

    const refreshedToken = await refreshPromise;
    expect(refreshedToken).toBe(accessToken);
    expect(service.getToken()).toBe(accessToken);
  });

  it('resetta token e utente al logout', () => {
    const requestSub = service.login('mrossi', loginCredential).subscribe();
    const request = httpMock.expectOne('http://localhost:3000/auth/login');
    request.flush({
      accessToken: createAccessToken({
        userId: 'user-1',
        username: 'mrossi',
        role: UserRole.AMMINISTRATORE,
        isFirstAccess: false,
      }),
    });
    requestSub.unsubscribe();

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.getRole()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('espone stream utente corrente con valore iniziale null', async () => {
    const currentUser = await firstValueFrom(service.getCurrentUser$());
    expect(currentUser).toBeNull();
  });
});
