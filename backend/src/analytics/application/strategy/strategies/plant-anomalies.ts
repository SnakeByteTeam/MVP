import { Injectable } from '@nestjs/common';
import { AnalyticsStrategy } from '../analytics.strategy';
import { PlantConsumption } from './plant-consumption';
import { Plot } from '../../../domain/plot.model';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { ANOMALY_THRESHOLD_WH } from './consumption-config';
import { Series } from 'src/analytics/domain/series.model';
import { AnalyticsMetric } from 'src/analytics/infrastructure/dtos/analytics.metric.dto';

const {
  title: TITLE,
  metric: METRIC,
  desc: DESC,
} = AnalyticsMetric.PLANT_ANOMALIES;

@Injectable()
export class PlantAnomalies implements AnalyticsStrategy {
  constructor(private readonly plantConsumption: PlantConsumption) {}

  async execute(cmd: GetAnalyticsCmd): Promise<Plot> {
    const consumptionPlot = await this.plantConsumption.execute(cmd);

    const labels = consumptionPlot.getLabels();
    const series = consumptionPlot.getSeries()[0];

    if (labels.length === 0 || !series) {
      return new Plot(TITLE, METRIC, 'anomalie', [], []);
    }

    const anomalyData: number[] = labels.map((_, i) =>
      series.getData()[i] > ANOMALY_THRESHOLD_WH ? 1 : 0,
    );

    return new Plot(TITLE, METRIC, 'anomalie', labels, [
      new Series(METRIC, DESC, anomalyData),
    ]);
  }
}
