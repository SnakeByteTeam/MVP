import { Component, inject } from '@angular/core';
import { AnalyticsApiService } from '../../../analytics/services/analytics-api.service';
import { AnalyticsDto } from '../../../analytics/models/analytics.model';
import { ChartInfoDto } from '../../../analytics/models/chart-info.model';
import { AlarmsSentResolvedChartComponent } from '../../../analytics/components/alarms-sent-resolved-chart/alarms-sent-resolved-chart.component';
import { EnergyConsumptionChartComponent } from '../../../analytics/components/energy-consumption-chart/energy-consumption-chart.component';
import { Observable,  switchMap, filter, BehaviorSubject, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({ 
    selector: 'app-analytics', 
    standalone: true, 
    imports: [
        CommonModule,
        AlarmsSentResolvedChartComponent,
        EnergyConsumptionChartComponent,
    ],
    templateUrl: './dashboard-page.component.html' })
export class dashboardComponent{    
    private analyticsApiService = inject(AnalyticsApiService);
    
    public selectedApartmentId$ = new BehaviorSubject<string | null>(null);
    
    public apartments$: Observable<any[]> | null = null;
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



