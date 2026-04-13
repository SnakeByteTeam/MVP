import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyticsComponent } from 'src/app/features/analytics/analytics.component';
import { AnalyticsApiService } from 'src/app/features/analytics/services/analytics-api.service';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsDto } from 'src/app/features/analytics/models/analytics.model';
import { Apartment } from 'src/app/features/apartment-monitor/models/apartment.model';
import { AlarmFrequencyChartComponent } from 'src/app/features/analytics/components/alarm-frequency-chart/alarm-frequency-chart.component';
import { AlarmsSentResolvedChartComponent } from 'src/app/features/analytics/components/alarms-sent-resolved-chart/alarms-sent-resolved-chart.component';
import { EnergyConsumptionChartComponent } from 'src/app/features/analytics/components/energy-consumption-chart/energy-consumption-chart.component';
import { FallFrequencyChartComponent } from 'src/app/features/analytics/components/fall-frequency-chart/fall-frequency-chart.component';
import { PlantAnomaliesChartComponent } from 'src/app/features/analytics/components/plant-anomalies-chart/plant-anomalies-chart.component';
import { PresenceDetectionChartComponent } from 'src/app/features/analytics/components/presence-detection-chart/presence-detection-chart.component';
import { ProlongedPresenceChartComponent } from 'src/app/features/analytics/components/prolonged-presence-chart/prolonged-presence-chart.component';
import { TemperatureVariationsChartComponent } from 'src/app/features/analytics/components/temperature-variations-chart/temperature-variations-chart.component';

@Component({ selector: 'app-alarm-frequency-chart', standalone: true, template: '' })
class AlarmFrequencyChartStubComponent {
  public readonly chartInfo = input<unknown>();
  public readonly showSuggestions = input<boolean>(false);
}

@Component({ selector: 'app-alarms-sent-resolved-chart', standalone: true, template: '' })
class AlarmsSentResolvedChartStubComponent {
  public readonly chartInfo = input<unknown>();
  public readonly showSuggestions = input<boolean>(false);
}

@Component({ selector: 'app-energy-consumption-chart', standalone: true, template: '' })
class EnergyConsumptionChartStubComponent {
  public readonly chartInfo = input<unknown>();
  public readonly showSuggestions = input<boolean>(false);
}

@Component({ selector: 'app-fall-frequency-chart', standalone: true, template: '' })
class FallFrequencyChartStubComponent {
  public readonly chartInfo = input<unknown>();
  public readonly showSuggestions = input<boolean>(false);
}

@Component({ selector: 'app-plant-anomalies-chart', standalone: true, template: '' })
class PlantAnomaliesChartStubComponent {
  public readonly chartInfo = input<unknown>();
  public readonly showSuggestions = input<boolean>(false);
}

@Component({ selector: 'app-presence-detection-chart', standalone: true, template: '' })
class PresenceDetectionChartStubComponent {
  public readonly chartInfo = input<unknown>();
  public readonly showSuggestions = input<boolean>(false);
}

@Component({ selector: 'app-prolonged-presence-chart', standalone: true, template: '' })
class ProlongedPresenceChartStubComponent {
  public readonly chartInfo = input<unknown>();
  public readonly showSuggestions = input<boolean>(false);
}

@Component({ selector: 'app-temperature-variations-chart', standalone: true, template: '' })
class TemperatureVariationsChartStubComponent {
  public readonly chartInfo = input<unknown>();
  public readonly showSuggestions = input<boolean>(false);
}

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
    })
      .overrideComponent(AnalyticsComponent, {
        remove: {
          imports: [
            AlarmFrequencyChartComponent,
            AlarmsSentResolvedChartComponent,
            EnergyConsumptionChartComponent,
            FallFrequencyChartComponent,
            PlantAnomaliesChartComponent,
            PresenceDetectionChartComponent,
            ProlongedPresenceChartComponent,
            TemperatureVariationsChartComponent,
          ],
        },
        add: {
          imports: [
            AlarmFrequencyChartStubComponent,
            AlarmsSentResolvedChartStubComponent,
            EnergyConsumptionChartStubComponent,
            FallFrequencyChartStubComponent,
            PlantAnomaliesChartStubComponent,
            PresenceDetectionChartStubComponent,
            ProlongedPresenceChartStubComponent,
            TemperatureVariationsChartStubComponent,
          ],
        },
      })
      .compileComponents();

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