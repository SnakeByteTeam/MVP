import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { MyVimarCloudApiFeatureService } from './my-vimar-cloud-api-feature.service';
import { DOCUMENT } from '@angular/common';

describe('MyVimarCloudApiFeatureService', () => {
  let service: MyVimarCloudApiFeatureService;
  let httpController: HttpTestingController;

  const baseUrl = 'http://api.example.test';
  const mockLocation = { href: 'http://localhost:4200/vimar-link', origin: 'http://localhost:4200' };
  const mockDocument = {
    defaultView: {
      location: mockLocation,
    },
  } as unknown as Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MyVimarCloudApiFeatureService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: DOCUMENT, useValue: mockDocument },
      ],
    });

    service = TestBed.inject(MyVimarCloudApiFeatureService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('chiama GET /api/vimar-account in getLinkedAccount', () => {
    service.getLinkedAccount().subscribe((account) => {
      expect(account).toEqual({ email: 'admin@example.com', isLinked: true });
    });

    const request = httpController.expectOne(`${baseUrl}/api/vimar-account`);
    expect(request.request.method).toBe('GET');
    request.flush({ email: 'admin@example.com', isLinked: true });
  });

  it('chiama POST /api/vimar-account/oauth/callback in handleOAuthCallback', () => {
    const payload = { code: 'code-123', state: 'state-abc' };

    service.handleOAuthCallback(payload).subscribe((result) => {
      expect(result).toBeNull();
    });

    const request = httpController.expectOne(`${baseUrl}/api/vimar-account/oauth/callback`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(null);
  });

  it('chiama DELETE /api/vimar-account in unlinkAccount', () => {
    service.unlinkAccount().subscribe((result) => {
      expect(result).toBeNull();
    });

    const request = httpController.expectOne(`${baseUrl}/api/vimar-account`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });

  it('chiama POST /api/vimar-account/oauth/authorize con redirect_url in initiateOAuth', () => {
    service.initiateOAuth();

    const request = httpController.expectOne(`${baseUrl}/api/vimar-account/oauth/authorize`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ redirect_url: 'http://localhost:4200/vimar-link/oauth-callback' });
    request.flush({ url: `${baseUrl}/api/vimar-account/oauth/authorize` });

    expect(mockLocation.href).toBe(`${baseUrl}/api/vimar-account/oauth/authorize`);
  });
});
