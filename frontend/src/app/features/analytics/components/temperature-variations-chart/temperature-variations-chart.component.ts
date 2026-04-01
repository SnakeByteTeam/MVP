import { Component, Input } from '@angular/core';
import { ChartComponent } from '../../interfaces/chart-component';
import { ChartInfoDto } from '../../models/chart-info.model';
import { ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';

@Component({ 
    selector: 'app-temperature-variations-chart', 
    standalone: true, 
    imports: [BaseChartDirective, CommonModule],
    templateUrl: '../chartsTemplates/device-chart-analytics.html'})
export class TemperatureVariationsChartComponent extends ChartComponent {

    override chartType: ChartType = 'line';

    override chartColors = [
        { bg: 'rgba(239, 97, 68, 0.5)', border: 'rgb(239, 97, 68)'}
    ];
}
