import { Component, Input, SimpleChanges  } from '@angular/core';
import { ChartComponent } from '../../interfaces/chart-component';
import { ChartInfoDto } from '../../models/chart-info.model';
import { ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';

@Component({ 
    selector: 'app-energy-consumption-chart', 
    standalone: true, 
    imports: [BaseChartDirective, CommonModule],
    templateUrl: '../chartsTemplates/apartment-chart-analytics.html'})
export class EnergyConsumptionChartComponent extends ChartComponent {

    override chartType: ChartType = 'line';

    override chartColors = [{ bg: 'rgba(228, 238, 43, 0.68)', border: 'rgb(107, 109, 3)' }];

    override updateChart(data: ChartInfoDto): void {
        const defaultColor = { bg: 'rgba(68, 119, 239, 0.5)', border: 'rgb(68, 225, 239)' };
        this.renderedChartData = {
            labels: data.labels,
            datasets: data.datasets.map((ds,index) => {
            const color = this.chartColors[index] ?? defaultColor;
            return{
                data: ds.data,
                label: ds.name, 
                backgroundColor: color.bg, 
                borderColor: color.border,
                borderWidth: 1,
                fill: true, 
                tension: 0.2 
            };
            })
        };
    }
}
