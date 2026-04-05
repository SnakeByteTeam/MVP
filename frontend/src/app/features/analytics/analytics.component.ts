import { Component, inject } from '@angular/core';
import { AnalyticsApiService } from './services/analytics-api.service';
import { AnalyticsDto } from './models/analytics.model';
import { ChartInfoDto } from './models/chart-info.model';
import { AlarmFrequencyChartComponent } from './components/alarm-frequency-chart/alarm-frequency-chart.component';
import { AlarmsSentResolvedChartComponent } from './components/alarms-sent-resolved-chart/alarms-sent-resolved-chart.component';
import { EnergyConsumptionChartComponent } from './components/energy-consumption-chart/energy-consumption-chart.component';
import { FallFrequencyChartComponent } from './components/fall-frequency-chart/fall-frequency-chart.component';
import { PlantAnomaliesChartComponent } from './components/plant-anomalies-chart/plant-anomalies-chart.component';
import { PresenceDetectionChartComponent } from './components/presence-detection-chart/presence-detection-chart.component';
import { ProlongedPresenceChartComponent } from './components/prolonged-presence-chart/prolonged-presence-chart.component';
import { TemperatureVariationsChartComponent } from './components/temperature-variations-chart/temperature-variations-chart.component';
import { Observable,  switchMap, filter, BehaviorSubject, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PlantDto } from '../apartment-monitor/models/plant-response.model';

@Component({ 
    selector: 'app-analytics', 
    standalone: true, 
    imports: [
        CommonModule,
        AlarmFrequencyChartComponent,
        AlarmsSentResolvedChartComponent,
        EnergyConsumptionChartComponent,
        FallFrequencyChartComponent,
        PlantAnomaliesChartComponent,
        PresenceDetectionChartComponent,
        ProlongedPresenceChartComponent,
        TemperatureVariationsChartComponent
    ],
    templateUrl: './analytics.component.html' })
export class AnalyticsComponent {
    
    private analyticsApiService = inject(AnalyticsApiService);
    
    public selectedApartmentId$ = new BehaviorSubject<string | null>(null);
    
    public apartments$: Observable<PlantDto[]> | null = null;
    public analytics: Observable<AnalyticsDto | null> | null = null;

    public ngOnInit(): void {
        this.apartments$ = this.analyticsApiService.getAllApartments();
        //default seleziona il primo appartamento
        this.apartments$.subscribe(apartments => {
            if (apartments.length > 0 && !this.selectedApartmentId$.value) {
                this.selectedApartmentId$.next(apartments[0].id);
            }
        });

        //reazione ai cambi di appartamento

        this.analytics = this.selectedApartmentId$.pipe(
            filter(id => id !== null), 
            switchMap(id => this.analyticsApiService.getAnalytics(id!).pipe(startWith(null)))
        );
    }

    public onApartmentChange(event: Event): void {
        const selectElement = event.target as HTMLSelectElement;
        this.selectedApartmentId$.next(selectElement.value);
    }

    public getChartByMetric(data: AnalyticsDto | null, metric: string): ChartInfoDto | undefined {
        return data?.analyticsInfo?.find(chart => chart.metric === metric);
    }
   
}



