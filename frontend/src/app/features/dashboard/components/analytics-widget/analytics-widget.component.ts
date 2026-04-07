import { Component, inject } from '@angular/core';
import { AnalyticsApiService } from '../../../analytics/services/analytics-api.service';
import { AnalyticsDto } from '../../../analytics/models/analytics.model';
import { ChartInfoDto } from '../../../analytics/models/chart-info.model';
import { AlarmsSentResolvedChartComponent } from '../../../analytics/components/alarms-sent-resolved-chart/alarms-sent-resolved-chart.component';
import { EnergyConsumptionChartComponent } from '../../../analytics/components/energy-consumption-chart/energy-consumption-chart.component';
import { Observable,  switchMap, filter, BehaviorSubject, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PlantDto } from '../../../apartment-monitor/models/plant-response.model';
import { combineLatest, map } from 'rxjs';
import { PlantOverviewComponent } from '../plant-overview/plant-overview.component';
import { OnInit } from '@angular/core';

@Component({ 
    selector: 'app-analytics-widget', 
    standalone: true, 
    imports: [
        CommonModule,
        AlarmsSentResolvedChartComponent,
        EnergyConsumptionChartComponent,
        PlantOverviewComponent
    ],
    templateUrl: './analytics-widget.component.html' })



export class AnalyticsWidgetComponent implements OnInit {
    private readonly refreshTrigger$ = new BehaviorSubject<boolean>(false);

    public selectedApartment$: Observable<PlantDto | undefined> | null = null;

    private readonly analyticsApiService = inject(AnalyticsApiService);
    private readonly loadTrigger$ = new BehaviorSubject<{ id: string; refresh: boolean } | null>(null);

    public selectedApartmentId$ = new BehaviorSubject<string | null>(null);
    
    public apartments$: Observable<PlantDto[]> | null = null;
    public analytics: Observable<AnalyticsDto | null> | null = null;

    public ngOnInit(): void {
        this.apartments$ = this.analyticsApiService.getAllApartments();
        this.apartments$.subscribe(apartments => {
            if (apartments.length > 0) {
                this.selectedApartmentId$.next(apartments[0].id);
                this.loadTrigger$.next({ id: apartments[0].id, refresh: false });
            }
        });

        
        this.selectedApartment$ = combineLatest([
            this.apartments$,
            this.selectedApartmentId$
        ]).pipe(
            map(([apartments, id]) => apartments.find(a => a.id === id))
        );

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

