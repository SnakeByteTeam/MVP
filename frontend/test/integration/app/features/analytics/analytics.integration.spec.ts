import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsComponent } from 'src/app/features/analytics/analytics.component';
import { AnalyticsApiService } from 'src/app/features/analytics/services/analytics-api.service';
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

@Component({
    selector: 'app-alarm-frequency-chart',
    standalone: true,
    template: '',
})
class AlarmFrequencyChartStubComponent {
    public readonly chartInfo = input<unknown>();
    public readonly showSuggestions = input<boolean>(false);
}

@Component({
    selector: 'app-alarms-sent-resolved-chart',
    standalone: true,
    template: '',
})
class AlarmsSentResolvedChartStubComponent {
    public readonly chartInfo = input<unknown>();
    public readonly showSuggestions = input<boolean>(false);
}

@Component({
    selector: 'app-energy-consumption-chart',
    standalone: true,
    template: '',
})
class EnergyConsumptionChartStubComponent {
    public readonly chartInfo = input<unknown>();
    public readonly showSuggestions = input<boolean>(false);
}

@Component({
    selector: 'app-fall-frequency-chart',
    standalone: true,
    template: '',
})
class FallFrequencyChartStubComponent {
    public readonly chartInfo = input<unknown>();
    public readonly showSuggestions = input<boolean>(false);
}

@Component({
    selector: 'app-plant-anomalies-chart',
    standalone: true,
    template: '',
})
class PlantAnomaliesChartStubComponent {
    public readonly chartInfo = input<unknown>();
    public readonly showSuggestions = input<boolean>(false);
}

@Component({
    selector: 'app-presence-detection-chart',
    standalone: true,
    template: '',
})
class PresenceDetectionChartStubComponent {
    public readonly chartInfo = input<unknown>();
    public readonly showSuggestions = input<boolean>(false);
}

@Component({
    selector: 'app-prolonged-presence-chart',
    standalone: true,
    template: '',
})
class ProlongedPresenceChartStubComponent {
    public readonly chartInfo = input<unknown>();
    public readonly showSuggestions = input<boolean>(false);
}

@Component({
    selector: 'app-temperature-variations-chart',
    standalone: true,
    template: '',
})
class TemperatureVariationsChartStubComponent {
    public readonly chartInfo = input<unknown>();
    public readonly showSuggestions = input<boolean>(false);
}

describe('Analytics feature integration', () => {
    let component: AnalyticsComponent;
    let fixture: ComponentFixture<AnalyticsComponent>;

    const apartments: Apartment[] = [
        { id: '1', name: 'Appartamento 1', isEnabled: true, rooms: [] },
        { id: '2', name: 'Appartamento 2', isEnabled: true, rooms: [] },
    ];

    const analyticsData: AnalyticsDto = {
        apartmentId: '1',
        analyticsInfo: [
            {
                title: 'Analisi Anomalie Impianto',
                metric: 'plant-anomalies',
                unit: 'anomalie',
                labels: ['Gen', 'Feb'],
                datasets: [{ id: 'anomalies', name: 'Anomalie', data: [1, 0] }],
                suggestions: { messages: [], isSuggestion: false },
            },
        ],
    };

    const analyticsApiStub = {
        getAllApartments: vi.fn(() => of(apartments)),
        getAnalytics: vi.fn(() => of(analyticsData)),
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        await TestBed.configureTestingModule({
            imports: [AnalyticsComponent],
            providers: [{ provide: AnalyticsApiService, useValue: analyticsApiStub }],
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
    });

    it('RF61-OBL inizializza appartamenti e carica analytics del primo plant', () => {
        fixture.detectChanges();

        expect(analyticsApiStub.getAllApartments).toHaveBeenCalled();
        expect(analyticsApiStub.getAnalytics).toHaveBeenCalledWith('1', expect.anything());
    });

    it('RF62-OBL cambio appartamento aggiorna i grafici', () => {
        fixture.detectChanges();

        component.onApartmentChange({ target: { value: '2' } } as unknown as Event);

        expect(analyticsApiStub.getAnalytics).toHaveBeenCalledWith('2', expect.anything());
    });

    it('RF63-OBL recupera correttamente una metrica esistente', () => {
        const chart = component.getChartByMetric(analyticsData, 'plant-anomalies');
        expect(chart?.metric).toBe('plant-anomalies');
    });
});
