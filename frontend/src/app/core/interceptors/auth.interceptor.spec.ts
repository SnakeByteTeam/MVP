import { HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InternalAuthService } from '../services/internal-auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const authServiceMock = {
    getToken: vi.fn(),
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
});
