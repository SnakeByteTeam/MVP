import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyticsComponent } from './analytics.component';
import { AnalyticsApiService } from './services/analytics-api.service';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsDto } from './models/analytics.model';
import { Apartment } from '../apartment-monitor/models/apartment.model';

describe('AnalyticsComponent', () => {
  let component: AnalyticsComponent;
  let fixture: ComponentFixture<AnalyticsComponent>;
  
  // Mock dei dati
  const mockApartments: Apartment[] = [
    { id: '1', name: 'Appartamento 1', isEnabled: true, rooms: [] },
    { id: '2', name: 'Appartamento 2', isEnabled: true, rooms: [] }
  ];

  const mockAnalyticsData: AnalyticsDto = {
    apartmentId:"1",
    analyticsInfo: [
      {
            title: "Analisi Anomalie Impianto",
            metric: "plant-anomalies",
            unit: "anomalie",
            labels: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago"],
            datasets: [
              {
                id: "anomalies",
                name: "Anomalie Rilevate",
                data: [1, 0, 2, 1, 0, 3, 1, 0]
              }
            ],
            suggestions:
              {
                messages:[],
                isSuggestion: false
              }
          }
    ]
  };

  // Creiamo un oggetto mock per il servizio
  const mockAnalyticsService = {
    getAllApartments: vi.fn(() => of(mockApartments)),
    getAnalytics: vi.fn((id: string) => of(mockAnalyticsData))
  };

  beforeEach(async () => { 

    await TestBed.configureTestingModule({
      imports: [AnalyticsComponent],
      providers: [
        { provide: AnalyticsApiService, useValue: mockAnalyticsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsComponent);
    component = fixture.componentInstance;
    
    vi.clearAllMocks();
  });

  it('viene creato', () => {
    expect(component).toBeTruthy();
  });

  it('carica il primo appartmento di default', () => {
    fixture.detectChanges(); 

    expect(mockAnalyticsService.getAllApartments).toHaveBeenCalled();

    expect(mockAnalyticsService.getAnalytics).toHaveBeenCalledWith('1', expect.anything());
  });

  it('aggiorna grafici al cambio appartamento', () => {
    fixture.detectChanges();
    
    const mockEvent = { target: { value: '2' } } as unknown as Event;
    component.onApartmentChange(mockEvent);

    expect(mockAnalyticsService.getAnalytics).toHaveBeenCalledWith('2', expect.anything());
  });

  it('should return undefined if metric is not found', () => {
    const result = component.getChartByMetric(mockAnalyticsData, 'unknown_metric');
    expect(result).toBeUndefined();
  });

  it('should find the correct metric in getChartByMetric', () => {
    const result = component.getChartByMetric(mockAnalyticsData, 'plant-anomalies');
    expect(result).toBeDefined();
    expect(result?.metric).toBe('plant-anomalies');
  });
});