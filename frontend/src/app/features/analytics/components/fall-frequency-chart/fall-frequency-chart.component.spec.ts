import { TestBed } from '@angular/core/testing';
import { FallFrequencyChartComponent } from './fall-frequency-chart.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { runSharedChartTests } from '../shared/chart-tests.helper';


describe('FallFrequencyChartComponent', () => {
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FallFrequencyChartComponent, BaseChartDirective],
      providers: [provideCharts(withDefaultRegisterables())]
    }).compileComponents();
  });

  it('espone metadati chart consistenti', () => {
    const fixture = TestBed.createComponent(FallFrequencyChartComponent);
    const component = fixture.componentInstance;

    expect(component.chartType).toBe('bar');
    expect(component.description.length).toBeGreaterThan(0);
  });

  runSharedChartTests(FallFrequencyChartComponent);
});