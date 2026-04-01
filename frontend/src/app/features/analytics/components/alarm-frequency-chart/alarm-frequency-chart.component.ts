import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartComponent } from '../../interfaces/chart-component';
import { ChartInfoDto } from '../../models/chart-info.model';
import { ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';

@Component({ 
    selector: 'app-alarm-frequency-chart', 
    standalone: true, 
    imports: [BaseChartDirective, CommonModule],
    templateUrl: '../chartsTemplates/ward-chart-analytics.html'})
export class AlarmFrequencyChartComponent extends ChartComponent {
    override chartType: ChartType = 'line';
}


  