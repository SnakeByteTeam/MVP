import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InternalAuthService } from 'src/app/core/services/internal-auth.service';
import { authInterceptor } from 'src/app/core/interceptors/auth.interceptor';

describe('authInterceptor', () => {
  const authServiceMock = {
    getToken: vi.fn(),
    refreshAccessToken: vi.fn(),
    logout: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: InternalAuthService, useValue: authServiceMock }],
    });
  });

  it('inoltra la richiesta invariata quando il token non esiste', () => {
    authServiceMock.getToken.mockReturnValue(null);
    const request = new HttpRequest('GET', '/api/resource');
    let capturedRequest: HttpRequest<unknown> | undefined;
    const next = vi.fn((forwardedRequest: HttpRequest<unknown>) => {
      capturedRequest = forwardedRequest;
      return of(new HttpResponse({ status: 200, body: forwardedRequest.url }));
    });

    TestBed.runInInjectionContext(() => authInterceptor(request, next)).subscribe();

    expect(capturedRequest).toBe(request);
    expect(capturedRequest?.headers.has('Authorization')).toBe(false);
  });

  it('aggiunge header Authorization Bearer quando il token esiste', () => {
    authServiceMock.getToken.mockReturnValue('jwt-123');
    const request = new HttpRequest('GET', '/api/resource');
    let capturedRequest: HttpRequest<unknown> | undefined;
    const next = vi.fn((forwardedRequest: HttpRequest<unknown>) => {
      capturedRequest = forwardedRequest;
      return of(new HttpResponse({ status: 200, body: forwardedRequest.url }));
    });

    TestBed.runInInjectionContext(() => authInterceptor(request, next)).subscribe();

    expect(capturedRequest).not.toBe(request);
    expect(capturedRequest?.headers.get('Authorization')).toBe('Bearer jwt-123');
  });

  it('aggiunge header Authorization anche su /auth/first-login', () => {
    authServiceMock.getToken.mockReturnValue('jwt-123');
    const request = new HttpRequest('POST', '/auth/first-login', {
      username: 'mrossi',
      tempPassword: 'temp',
      password: 'new-password',
    });
    let capturedRequest: HttpRequest<unknown> | undefined;
    const next = vi.fn((forwardedRequest: HttpRequest<unknown>) => {
      capturedRequest = forwardedRequest;
      return of(new HttpResponse({ status: 200 }));
    });

    TestBed.runInInjectionContext(() => authInterceptor(request, next)).subscribe();

    expect(capturedRequest?.headers.get('Authorization')).toBe('Bearer jwt-123');
  });

  it('su 401 esegue refresh e ritenta con il nuovo access token', () => {
    authServiceMock.getToken.mockReturnValue('jwt-old');
    authServiceMock.refreshAccessToken.mockReturnValue(of('jwt-new'));

    const request = new HttpRequest('GET', '/api/resource');
    const forwardedRequests: HttpRequest<unknown>[] = [];
    const next = vi.fn((forwardedRequest: HttpRequest<unknown>) => {
      forwardedRequests.push(forwardedRequest);
      if (forwardedRequests.length === 1) {
        return throwError(() => new HttpErrorResponse({ status: 401 }));
      }
      return of(new HttpResponse({ status: 200 }));
    });

    TestBed.runInInjectionContext(() => authInterceptor(request, next)).subscribe();

    expect(authServiceMock.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(forwardedRequests).toHaveLength(2);
    expect(forwardedRequests[0].headers.get('Authorization')).toBe('Bearer jwt-old');
    expect(forwardedRequests[1].headers.get('Authorization')).toBe('Bearer jwt-new');
  });

  it('non tenta refresh quando la 401 arriva da un endpoint auth', () => {
    authServiceMock.getToken.mockReturnValue('jwt-old');

    const request = new HttpRequest('POST', '/auth/refresh', null);
    const next = vi.fn(() => throwError(() => new HttpErrorResponse({ status: 401 })));

    TestBed.runInInjectionContext(() => authInterceptor(request, next)).subscribe({
      error: () => undefined,
    });

    expect(authServiceMock.refreshAccessToken).not.toHaveBeenCalled();
  });

  it('non tenta refresh quando la 401 arriva da /auth/first-login', () => {
    authServiceMock.getToken.mockReturnValue('jwt-old');

    const request = new HttpRequest('POST', '/auth/first-login', null);
    const next = vi.fn(() => throwError(() => new HttpErrorResponse({ status: 401 })));

    TestBed.runInInjectionContext(() => authInterceptor(request, next)).subscribe({
      error: () => undefined,
    });

    expect(authServiceMock.refreshAccessToken).not.toHaveBeenCalled();
  });
});
