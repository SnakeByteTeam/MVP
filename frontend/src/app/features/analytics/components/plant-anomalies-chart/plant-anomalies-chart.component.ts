import { Component, Input } from '@angular/core';
import { ChartComponent } from '../../interfaces/chart-component';
import { ChartInfoDto } from '../../models/chart-info.model';
import { ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';

@Component({ 
    selector: 'app-plant-anomalies-chart', 
    standalone: true, 
    imports: [BaseChartDirective, CommonModule],
    templateUrl: '../shared/chart-analytics.html'})
export class PlantAnomaliesChartComponent extends ChartComponent {

    override chartType: ChartType = 'bar';

    override description: string = "Dati relativi alle anomalie totali dell'appartamento.";

}
