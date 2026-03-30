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

    const anomalyLabels: string[] = [];
    const anomalyValues: string[] = [];
    const series = consumptionPlot.getSeries()[0];

    for (let i = 0; i < consumptionPlot.getLabels().length; i++) {
      const wh = series.getData()[i];
      if (wh > ANOMALY_THRESHOLD_WH) {
        anomalyLabels.push(consumptionPlot.getLabels()[i]);
        anomalyValues.push(wh.toFixed(2));
      }
    }

    return new Plot(
      'Plant Anomalies Analytics',
      'plant-anomalies',
      '',
      anomalyLabels,
      [new Series('', '', anomalyValues.map(Number))],
    );
  }
}
