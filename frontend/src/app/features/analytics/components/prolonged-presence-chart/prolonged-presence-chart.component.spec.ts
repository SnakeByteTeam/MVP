import { TestBed } from '@angular/core/testing';
import { ProlongedPresenceChartComponent } from './prolonged-presence-chart.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { runSharedChartTests } from '../shared/chart-tests.spec';


describe('PlantAnomaliesChartComponent', () => {
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProlongedPresenceChartComponent, BaseChartDirective],
      providers: [provideCharts(withDefaultRegisterables())]
    }).compileComponents();
  });

  runSharedChartTests(ProlongedPresenceChartComponent);
});