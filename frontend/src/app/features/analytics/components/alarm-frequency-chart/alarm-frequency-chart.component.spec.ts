import { TestBed } from '@angular/core/testing';
import { AlarmFrequencyChartComponent } from './alarm-frequency-chart.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { runSharedChartTests } from '../shared/chart-tests.spec';


describe('AlarmFrequencyChartComponent', () => {
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlarmFrequencyChartComponent, BaseChartDirective],
      providers: [provideCharts(withDefaultRegisterables())]
    }).compileComponents();
  });

  runSharedChartTests(AlarmFrequencyChartComponent);
});