import { TestBed } from '@angular/core/testing';
import { EnergyConsumptionChartComponent } from './energy-consumption-chart.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { runSharedChartTests } from '../shared/chart-tests';


describe('AlarmsSentResolvedChartComponent', () => {
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnergyConsumptionChartComponent, BaseChartDirective],
      providers: [provideCharts(withDefaultRegisterables())]
    }).compileComponents();
  });

  runSharedChartTests(EnergyConsumptionChartComponent);
});