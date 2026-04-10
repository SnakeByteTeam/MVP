import { TestBed } from '@angular/core/testing';
import { TemperatureVariationsChartComponent } from './temperature-variations-chart.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { runSharedChartTests } from '../shared/chart-tests.helper';


describe('TemperatureVariationsChartComponent', () => {
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemperatureVariationsChartComponent, BaseChartDirective],
      providers: [provideCharts(withDefaultRegisterables())]
    }).compileComponents();
  });

  it('espone metadati chart consistenti', () => {
    const fixture = TestBed.createComponent(TemperatureVariationsChartComponent);
    const component = fixture.componentInstance;

    expect(component.chartType).toBe('line');
    expect(component.description.length).toBeGreaterThan(0);
  });

  runSharedChartTests(TemperatureVariationsChartComponent);
});