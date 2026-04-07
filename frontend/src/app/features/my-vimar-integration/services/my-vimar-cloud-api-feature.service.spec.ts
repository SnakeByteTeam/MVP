import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { ApiErrorDisplayService } from '../../../core/services/api-error-display.service';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { MyVimarCloudApiFeatureService } from './my-vimar-cloud-api-feature.service';
import { DOCUMENT } from '@angular/common';

describe('MyVimarCloudApiFeatureService', () => {
  let service: MyVimarCloudApiFeatureService;
  let httpController: HttpTestingController;

  const baseUrl = 'http://api.example.test';
  const mockLocation = { href: 'http://localhost:4200/vimar-link', origin: 'http://localhost:4200' };
  const mockAlert = vi.fn();
  const apiErrorDisplayServiceStub = {
    toMessage: vi.fn(() => 'Errore avvio OAuth'),
  };
  const mockDocument = {
    defaultView: {
      location: mockLocation,
      alert: mockAlert,
    },
  } as unknown as Document;

  beforeEach(() => {
    mockLocation.href = 'http://localhost:4200/vimar-link';
    mockAlert.mockReset();
    apiErrorDisplayServiceStub.toMessage.mockReset();
    apiErrorDisplayServiceStub.toMessage.mockReturnValue('Errore avvio OAuth');

    TestBed.configureTestingModule({
      providers: [
        MyVimarCloudApiFeatureService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ApiErrorDisplayService, useValue: apiErrorDisplayServiceStub },
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: DOCUMENT, useValue: mockDocument },
      ],
    });

    service = TestBed.inject(MyVimarCloudApiFeatureService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
    TestBed.resetTestingModule();
  });

  it('chiama GET /my-vimar/account in getLinkedAccount', () => {
    service.getLinkedAccount().subscribe((account) => {
      expect(account).toEqual({ email: 'admin@example.com', isLinked: true });
    });

    const request = httpController.expectOne(`${baseUrl}/my-vimar/account`);
    expect(request.request.method).toBe('GET');
    request.flush({ email: 'admin@example.com', isLinked: true });
  });

  it('fallback su /api/vimar-account quando /my-vimar/account risponde 404', () => {
    service.getLinkedAccount().subscribe((account) => {
      expect(account).toEqual({ email: 'admin@example.com', isLinked: true });
    });

    const firstRequest = httpController.expectOne(`${baseUrl}/my-vimar/account`);
    expect(firstRequest.request.method).toBe('GET');
    firstRequest.flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });

    const fallbackRequest = httpController.expectOne(`${baseUrl}/api/vimar-account`);
    expect(fallbackRequest.request.method).toBe('GET');
    fallbackRequest.flush({ email: 'admin@example.com', isLinked: true });
  });

  it('ritorna account scollegato quando entrambi gli endpoint non esistono', () => {
    service.getLinkedAccount().subscribe((account) => {
      expect(account).toEqual({ email: '', isLinked: false });
    });

    const firstRequest = httpController.expectOne(`${baseUrl}/my-vimar/account`);
    firstRequest.flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });

    const fallbackRequest = httpController.expectOne(`${baseUrl}/api/vimar-account`);
    fallbackRequest.flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });
  });

  it('chiama DELETE /my-vimar/account in unlinkAccount', () => {
    service.unlinkAccount().subscribe((result) => {
      expect(result).toBeNull();
    });

    const request = httpController.expectOne(`${baseUrl}/my-vimar/account`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });

  it('fallback su DELETE /api/vimar-account quando /my-vimar/account non esiste', () => {
    service.unlinkAccount().subscribe((result) => {
      expect(result).toBeNull();
    });

    const firstRequest = httpController.expectOne(`${baseUrl}/my-vimar/account`);
    expect(firstRequest.request.method).toBe('DELETE');
    firstRequest.flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });

    const fallbackRequest = httpController.expectOne(`${baseUrl}/api/vimar-account`);
    expect(fallbackRequest.request.method).toBe('DELETE');
    fallbackRequest.flush(null);
  });

  it('richiede ticket OAuth e poi naviga su /api/auth/authorize', () => {
    service.initiateOAuth();

    const request = httpController.expectOne(`${baseUrl}/api/auth/prepare-oauth`);
    expect(request.request.method).toBe('POST');
    request.flush({ ticket: 'ticket-123' });

    expect(mockLocation.href).toBe(
      `${baseUrl}/api/auth/authorize?ticket=ticket-123&redirect_url=http%3A%2F%2Flocalhost%3A4200%2Fvimar-link`
    );
  });

  it('mostra alert quando il backend restituisce ticket vuoto', () => {
    service.initiateOAuth();

    const request = httpController.expectOne(`${baseUrl}/api/auth/prepare-oauth`);
    request.flush({ ticket: '' });

    expect(mockAlert).toHaveBeenCalledTimes(1);
    expect(mockAlert).toHaveBeenCalledWith('Ticket OAuth non valido. Riprova tra qualche istante.');
    expect(mockLocation.href).toBe('http://localhost:4200/vimar-link');
  });

  it('mostra alert con messaggio mappato quando prepare-oauth fallisce', () => {
    service.initiateOAuth();

    const request = httpController.expectOne(`${baseUrl}/api/auth/prepare-oauth`);
    request.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(apiErrorDisplayServiceStub.toMessage).toHaveBeenCalledTimes(1);
    expect(mockAlert).toHaveBeenCalledTimes(1);
    expect(mockAlert).toHaveBeenCalledWith('Errore avvio OAuth');
    expect(mockLocation.href).toBe('http://localhost:4200/vimar-link');
  });
});
