import { Component, inject, OnInit } from '@angular/core';
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
import { Observable, switchMap, filter, BehaviorSubject, startWith, combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';

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
    templateUrl: './analytics.component.html'
})
export class AnalyticsComponent implements OnInit {
    private readonly refreshTrigger$ = new BehaviorSubject<boolean>(false);

    private readonly analyticsApiService = inject(AnalyticsApiService);
    private readonly loadTrigger$ = new BehaviorSubject<{ id: string; refresh: boolean } | null>(null);

    public selectedApartmentId$ = new BehaviorSubject<string | null>(null);

    public apartments$: Observable<any[]> | null = null;
    public analytics: Observable<AnalyticsDto | null> | null = null;

    public ngOnInit(): void {
        this.apartments$ = this.analyticsApiService.getAllApartments();
        this.apartments$.subscribe(apartments => {
            if (apartments.length > 0) {
                this.selectedApartmentId$.next(apartments[0].id);
                this.loadTrigger$.next({ id: apartments[0].id, refresh: false });
            }
        });

        this.analytics = this.loadTrigger$.pipe(
            filter(trigger => trigger !== null),
            switchMap(trigger =>
                this.analyticsApiService
                    .getAnalytics(trigger.id, trigger.refresh)
                    .pipe(startWith(null))
            )
        );
    }

    public getChartByMetric(data: AnalyticsDto | null, metric: string): ChartInfoDto | undefined {
        return data?.analyticsInfo?.find(chart => chart.metric === metric);
    }

    public onApartmentChange(event: Event): void {
        const id = (event.target as HTMLSelectElement).value;
        this.selectedApartmentId$.next(id);
        this.loadTrigger$.next({ id, refresh: false });
    }

    public onRefresh(): void {
        const currentId = this.selectedApartmentId$.value;
        if (!currentId) return;
        this.loadTrigger$.next({ id: currentId, refresh: true });
    }

}



