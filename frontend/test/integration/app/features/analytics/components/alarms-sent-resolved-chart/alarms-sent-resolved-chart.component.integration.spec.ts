import { TestBed } from '@angular/core/testing';
import { AlarmsSentResolvedChartComponent } from 'src/app/features/analytics/components/alarms-sent-resolved-chart/alarms-sent-resolved-chart.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { runSharedChartTests } from 'src/app/features/analytics/components/shared/chart-tests.helper';


describe('AlarmsSentResolvedChartComponent', () => {
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlarmsSentResolvedChartComponent, BaseChartDirective],
      providers: [provideCharts(withDefaultRegisterables())]
    }).compileComponents();
  });

  it('espone metadati chart consistenti', () => {
    const fixture = TestBed.createComponent(AlarmsSentResolvedChartComponent);
    const component = fixture.componentInstance;

    expect(component.chartType).toBe('bar');
    expect(component.description.length).toBeGreaterThan(0);
  });

  runSharedChartTests(AlarmsSentResolvedChartComponent);
});