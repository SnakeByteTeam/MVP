import { TestBed } from '@angular/core/testing';
import { AlarmsSentResolvedChartComponent } from './alarms-sent-resolved-chart.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { runSharedChartTests } from '../shared/chart-tests.helper';


describe('AlarmsSentResolvedChartComponent', () => {
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlarmsSentResolvedChartComponent, BaseChartDirective],
      providers: [provideCharts(withDefaultRegisterables())]
    }).compileComponents();
  });

  runSharedChartTests(AlarmsSentResolvedChartComponent);
});