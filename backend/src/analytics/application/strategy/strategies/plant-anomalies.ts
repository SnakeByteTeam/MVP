import { Injectable } from '@nestjs/common';
import { AnalyticsStrategy } from '../analytics.strategy';
import { PlantConsumption } from './plant-consumption';
import { Plot } from '../../../domain/plot.model';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { ANOMALY_THRESHOLD_WH } from './consumption-config';
import { Series } from 'src/analytics/domain/series.model';

@Injectable()
export class PlantAnomalies implements AnalyticsStrategy {
  constructor(private readonly plantConsumption: PlantConsumption) {}

  async execute(cmd: GetAnalyticsCmd): Promise<Plot> {
    const consumptionPlot = await this.plantConsumption.execute(cmd);

    const series = consumptionPlot.getSeries()[0];
    let anomalyCount = 0;

    for (let i = 0; i < consumptionPlot.getLabels().length; i++) {
      if (series.getData()[i] > ANOMALY_THRESHOLD_WH) {
        anomalyCount++;
      }
    }

    return new Plot(
      'Plant Anomalies Analytics',
      'plant-anomalies',
      'anomalies',
      ['Total'],
      [new Series('anomalies', 'Anomalies Detected', [anomalyCount])],
    );
  }
}
