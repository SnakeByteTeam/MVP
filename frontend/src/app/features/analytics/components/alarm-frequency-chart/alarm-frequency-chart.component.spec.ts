import { TestBed } from '@angular/core/testing';
import { AlarmFrequencyChartComponent } from './alarm-frequency-chart.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { runSharedChartTests } from '../shared/chart-tests.helper';


describe('AlarmFrequencyChartComponent', () => {
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlarmFrequencyChartComponent, BaseChartDirective],
      providers: [provideCharts(withDefaultRegisterables())]
    }).compileComponents();
  });

  it('espone metadati chart consistenti', () => {
    const fixture = TestBed.createComponent(AlarmFrequencyChartComponent);
    const component = fixture.componentInstance;

    expect(component.chartType).toBe('bar');
    expect(component.description.length).toBeGreaterThan(0);
  });

  runSharedChartTests(AlarmFrequencyChartComponent);
});