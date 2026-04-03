import { TestBed } from '@angular/core/testing';
import { FallFrequencyChartComponent } from './fall-frequency-chart.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { runSharedChartTests } from '../shared/chart-tests.spec';


describe('AlarmsSentResolvedChartComponent', () => {
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FallFrequencyChartComponent, BaseChartDirective],
      providers: [provideCharts(withDefaultRegisterables())]
    }).compileComponents();
  });

  runSharedChartTests(FallFrequencyChartComponent);
});