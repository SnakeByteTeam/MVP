import { Injectable, Inject } from '@nestjs/common';
import { AnalyticsStrategy } from '../analytics.strategy';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { Plot } from '../../../domain/plot.model';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { Series } from 'src/analytics/domain/series.model';
import { AnalyticsMetric } from 'src/analytics/infrastructure/dtos/analytics.metric.dto';

const {
  title: TITLE,
  metric: METRIC,
  unit: UNIT,
  sfeType: SFE_TYPE,
} = AnalyticsMetric.THERMOSTAT_TEMPERATURE;

@Injectable()
export class PlantThermostatTemperature implements AnalyticsStrategy {
  constructor(
    @Inject('GET_ANALYTICS_PORT')
    private readonly analyticsPort: GetAnalyticsPort,
  ) {}

  async execute(cmd: GetAnalyticsCmd): Promise<Plot> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const snapshotsMap = await this.analyticsPort.getDataForPlant(
      cmd.plantId,
      startDate,
    );

    if (snapshotsMap.size === 0) {
      return new Plot(TITLE, METRIC, '', [], []);
    }

    const snapshots = Array.from(snapshotsMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    const tempByDay = new Map<string, { sum: number; count: number }>();
    const lastSeenValue = new Map<string, string>();

    for (const [timestamp, datapoints] of snapshots) {
      const day = timestamp.slice(0, 10);

      for (const dp of datapoints) {
        if (dp.sfeType !== SFE_TYPE) continue;

        if (lastSeenValue.get(dp.datapointId) === dp.value) continue;
        lastSeenValue.set(dp.datapointId, dp.value);

        const temp = Number.parseFloat(dp.value ?? '');
        if (Number.isNaN(temp)) continue;

        const existing = tempByDay.get(day) ?? { sum: 0, count: 0 };
        tempByDay.set(day, {
          sum: existing.sum + temp,
          count: existing.count + 1,
        });
      }
    }

    const sorted = Array.from(tempByDay.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    const labels = sorted.map(([day]) => day);
    const values = sorted.map(([, { sum, count }]) => sum / count);

    return new Plot(TITLE, METRIC, UNIT, labels, [new Series('', '', values)]);
  }
}
