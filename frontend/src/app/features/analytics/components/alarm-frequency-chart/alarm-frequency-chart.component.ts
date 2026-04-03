import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartComponent } from '../../interfaces/chart-component';
import { ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';

@Component({ 
    selector: 'app-alarm-frequency-chart', 
    standalone: true, 
    imports: [BaseChartDirective, CommonModule],
    templateUrl: '../shared/ward-chart-analytics.html'})
export class AlarmFrequencyChartComponent extends ChartComponent {
    override chartType: ChartType = 'line';
}


  