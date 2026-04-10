import { TestBed } from '@angular/core/testing';
import { ProlongedPresenceChartComponent } from './prolonged-presence-chart.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { runSharedChartTests } from '../shared/chart-tests.helper';


describe('ProlongedPresenceChartComponent', () => {
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProlongedPresenceChartComponent, BaseChartDirective],
      providers: [provideCharts(withDefaultRegisterables())]
    }).compileComponents();
  });

  it('espone metadati chart consistenti', () => {
    const fixture = TestBed.createComponent(ProlongedPresenceChartComponent);
    const component = fixture.componentInstance;

    expect(component.chartType).toBe('bar');
    expect(component.description.length).toBeGreaterThan(0);
  });

  runSharedChartTests(ProlongedPresenceChartComponent);
});