import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsApiService } from 'src/app/features/analytics/services/analytics-api.service';
import { AnalyticsWidgetComponent } from 'src/app/features/dashboard/components/analytics-widget/analytics-widget.component';
import { AlarmsSentResolvedChartComponent } from 'src/app/features/analytics/components/alarms-sent-resolved-chart/alarms-sent-resolved-chart.component';
import { EnergyConsumptionChartComponent } from 'src/app/features/analytics/components/energy-consumption-chart/energy-consumption-chart.component';

@Component({
    selector: 'app-energy-consumption-chart',
    standalone: true,
    template: '<div class="energy-chart-stub"></div>',
})
class EnergyConsumptionChartStubComponent {
    public readonly chartInfo = input<unknown>();
    public readonly showSuggestions = input<boolean>(false);
}

@Component({
    selector: 'app-alarms-sent-resolved-chart',
    standalone: true,
    template: '<div class="alarms-chart-stub"></div>',
})
class AlarmsSentResolvedChartStubComponent {
    public readonly chartInfo = input<unknown>();
    public readonly showSuggestions = input<boolean>(false);
}

describe('AnalyticsWidget feature integration', () => {
    let fixture: ComponentFixture<AnalyticsWidgetComponent>;
    let component: AnalyticsWidgetComponent;

    const apartments = [
        {
            id: 'plant-1',
            name: 'Appartamento 1',
            rooms: [
                {
                    id: 'room-1',
                    name: 'Soggiorno',
                    devices: [{ id: 'd1', name: 'Termostato', datapoints: [] }],
                },
            ],
        },
        {
            id: 'plant-2',
            name: 'Appartamento 2',
            rooms: [],
        },
    ];

    const analyticsData = {
        apartmentId: 'plant-1',
        analyticsInfo: [
            {
                title: 'Consumi',
                metric: 'plant-consumption',
                unit: 'kWh',
                labels: ['Gen'],
                datasets: [{ id: 'd1', name: 'Consumo', data: [12] }],
                suggestions: { messages: [], isSuggestion: false },
            },
            {
                title: 'Allarmi',
                metric: 'ward-resolved-alarm',
                unit: 'n',
                labels: ['Gen'],
                datasets: [{ id: 'd2', name: 'Risolti', data: [2] }],
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
            imports: [AnalyticsWidgetComponent],
            providers: [{ provide: AnalyticsApiService, useValue: analyticsApiStub }],
        })
            .overrideComponent(AnalyticsWidgetComponent, {
                remove: { imports: [EnergyConsumptionChartComponent, AlarmsSentResolvedChartComponent] },
                add: { imports: [EnergyConsumptionChartStubComponent, AlarmsSentResolvedChartStubComponent] },
            })
            .compileComponents();

        fixture = TestBed.createComponent(AnalyticsWidgetComponent);
        component = fixture.componentInstance;
    });

    it('RF45-OBL inizializza widget e carica analytics del primo appartamento', () => {
        fixture.detectChanges();

        expect(analyticsApiStub.getAllApartments).toHaveBeenCalledTimes(1);
        expect(analyticsApiStub.getAnalytics).toHaveBeenCalledWith('plant-1', false);
    });

    it('RF45-OBL cambio appartamento aggiorna richiesta analytics', () => {
        fixture.detectChanges();

        component.onApartmentChange({ target: { value: 'plant-2' } } as unknown as Event);

        expect(analyticsApiStub.getAnalytics).toHaveBeenCalledWith('plant-2', false);
    });

    it('RF45-OBL renderizza overview appartamento selezionato', () => {
        fixture.detectChanges();

        const overview = fixture.nativeElement.querySelector('plant-overview');
        expect(overview).not.toBeNull();
        expect(fixture.nativeElement.textContent).toContain('Appartamento Monitorato');
    });
});
