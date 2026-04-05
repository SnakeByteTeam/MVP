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
    templateUrl: '../shared/chart-analytics.html'})
export class EnergyConsumptionChartComponent extends ChartComponent {

    override description: string = "Dati relativi ai consumi dell'illuminazione dell'appartamento.";

    override chartType: ChartType = 'line';

    override fillArea = true;

    override chartColors = [{ bg: 'rgba(228, 238, 43, 0.68)', border: 'rgb(107, 109, 3)' }];

}
