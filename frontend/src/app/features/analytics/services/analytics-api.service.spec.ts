import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AnalyticsApiService } from './analytics-api.service';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('AnalyticsApiService', () => {
  let service: AnalyticsApiService;
  let httpMock: HttpTestingController;
  const mockBaseUrl = 'https://api.test.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AnalyticsApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: mockBaseUrl }
      ]
    });

    service = TestBed.inject(AnalyticsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllApartments', () => {
    it('should fetch all apartments and map them correctly', () => {
      const mockApiResponse = [
        { id: '1', name: 'Apartment 1', extraField: 'ignore me' },
        { id: '2', name: 'Apartment 2' }
      ];

      service.getAllApartments().subscribe((apartments) => {
        expect(apartments.length).toBe(2);
        expect(apartments[0]).toEqual({ id: '1', name: 'Apartment 1' });
        expect(apartments[0]).not.toHaveProperty('extraField');
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/plant/all`);
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse); 
    });
  });

  describe('getAnalytics', () => {
    it('should fetch analytics and map the complex DTO structure', () => {
      const apartmentId = 'apt-123';
      const mockRawResponse = [
        {
          title: 'Test Chart',
          metric: 'test-metric',
          unit: 'Wh',
          labels: ['Mon', 'Tue'],
          series: [
            { id: 's1', name: 'Series 1', data: [10, 20] }
          ],
          suggestion: {
            message: ['Suggestion 1'],
            isSuggestion: true
          }
        }
      ];

      service.getAnalytics(apartmentId).subscribe((result) => {
        expect(result.apartmentId).toBe(apartmentId);
        expect(result.analyticsInfo.length).toBe(1);
        
        const info = result.analyticsInfo[0];
        expect(info.title).toBe('Test Chart');
        expect(info.suggestions.messages).toEqual(['Suggestion 1']);
        expect(info.datasets[0].name).toBe('Series 1');
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/analytics/${apartmentId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRawResponse);
    });
  });
});