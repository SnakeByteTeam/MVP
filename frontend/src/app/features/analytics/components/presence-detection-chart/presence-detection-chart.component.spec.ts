import { TestBed } from '@angular/core/testing';
import { PresenceDetectionChartComponent } from './presence-detection-chart.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { runSharedChartTests } from '../shared/chart-tests.helper';


describe('PlantAnomaliesChartComponent', () => {
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresenceDetectionChartComponent, BaseChartDirective],
      providers: [provideCharts(withDefaultRegisterables())]
    }).compileComponents();
  });

  runSharedChartTests(PresenceDetectionChartComponent);
});