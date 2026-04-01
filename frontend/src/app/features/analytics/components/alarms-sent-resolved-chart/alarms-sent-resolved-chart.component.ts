import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartComponent } from '../../interfaces/chart-component';
import { ChartInfoDto } from '../../models/chart-info.model';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartType } from 'chart.js';

@Component({ 
    selector: 'app-alarms-sent-resolved-chart', 
    standalone: true, 
    imports: [BaseChartDirective, CommonModule],
    templateUrl: '../chartsTemplates/ward-chart-analytics.html'})
export class AlarmsSentResolvedChartComponent extends ChartComponent {

    override chartType: ChartType = 'line';
}
