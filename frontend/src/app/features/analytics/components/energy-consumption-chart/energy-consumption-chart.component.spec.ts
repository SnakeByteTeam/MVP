import { TestBed } from '@angular/core/testing';
import { EnergyConsumptionChartComponent } from './energy-consumption-chart.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { runSharedChartTests } from '../shared/chart-tests.helper';


describe('EnergyConsumptionChartComponent', () => {
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnergyConsumptionChartComponent, BaseChartDirective],
      providers: [provideCharts(withDefaultRegisterables())]
    }).compileComponents();
  });

  it('espone metadati chart consistenti', () => {
    const fixture = TestBed.createComponent(EnergyConsumptionChartComponent);
    const component = fixture.componentInstance;

    expect(component.chartType).toBe('line');
    expect(component.description.length).toBeGreaterThan(0);
  });

  runSharedChartTests(EnergyConsumptionChartComponent);
});