import { Component, Input } from '@angular/core';
import { ChartComponent } from '../../interfaces/chart-component';
import { ChartInfoDto } from '../../models/chart-info.model';
import { ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';

@Component({ 
    selector: 'app-presence-detection-chart', 
    standalone: true, 
    imports: [BaseChartDirective, CommonModule],
    templateUrl: '../chartsTemplates/device-chart-analytics.html'})
export class PresenceDetectionChartComponent extends ChartComponent {

    override chartType: ChartType = 'bar';
}
