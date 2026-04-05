import { TestBed } from '@angular/core/testing';
import { PlantAnomaliesChartComponent } from './plant-anomalies-chart.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { runSharedChartTests } from '../shared/chart-tests.helper';


describe('PlantAnomaliesChartComponent', () => {
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantAnomaliesChartComponent, BaseChartDirective],
      providers: [provideCharts(withDefaultRegisterables())]
    }).compileComponents();
  });

  runSharedChartTests(PlantAnomaliesChartComponent);
});