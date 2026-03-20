import { Injectable } from '@nestjs/common';
import { AnalyticsStrategy } from '../analytics.strategy';
import { PlantConsumption } from './plant-consumption';
import { Plot } from 'src/analytics/domain/plot.model';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { ANOMALY_THRESHOLD_WH } from './consumption-config';

@Injectable()
export class PlantAnomalies implements AnalyticsStrategy {
  constructor(private readonly plantConsumption: PlantConsumption) {}

  async execute(cmd: GetAnalyticsCmd): Promise<Plot> {
    const consumptionPlot = await this.plantConsumption.execute(cmd);

    const anomalyLabels: string[] = [];
    const anomalyValues: string[] = [];

    for (let i = 0; i < consumptionPlot.labels.length; i++) {
      const wh = parseFloat(consumptionPlot.data[i]);
      if (wh > ANOMALY_THRESHOLD_WH) {
        anomalyLabels.push(consumptionPlot.labels[i]);
        anomalyValues.push(wh.toFixed(2));
      }
    }

    return new Plot(
      'Plant Anomalies Analytics',
      cmd.metric,
      anomalyLabels,
      anomalyValues,
    );
  }
}
