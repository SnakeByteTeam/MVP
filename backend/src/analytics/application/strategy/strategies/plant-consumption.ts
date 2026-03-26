import { Injectable, Inject } from '@nestjs/common';
import { AnalyticsStrategy } from '../analytics.strategy';
import { Plot } from 'src/analytics/domain/plot.model';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { getDeviceWatt, isDeviceActive } from './consumption-config';

@Injectable()
export class PlantConsumption implements AnalyticsStrategy {
  constructor(
    @Inject('GET_ANALYTICS_PORT')
    private readonly analyticsPort: GetAnalyticsPort,
  ) {}

  async execute(cmd: GetAnalyticsCmd): Promise<Plot> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const snapshotsMap = await this.analyticsPort.getDataByPlantId(
      cmd.id,
      startDate,
    );

    if (snapshotsMap.size === 0) {
      return new Plot('Plant Consumption Analytics', cmd.metric, [], []);
    }

    const snapshots = Array.from(snapshotsMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    const consumptionByDay = new Map<string, number>();

    for (let i = 0; i < snapshots.length - 1; i++) {
      const [currentTs, currentDps] = snapshots[i];
      const [nextTs] = snapshots[i + 1];

      const deltaHours =
        (new Date(nextTs).getTime() - new Date(currentTs).getTime()) /
        3_600_000;

      const day = currentTs.slice(0, 10);
      const existing = consumptionByDay.get(day) ?? 0;

      let wh = 0;
      for (const dp of currentDps) {
        if (isDeviceActive(dp)) {
          wh += getDeviceWatt(dp.deviceType) * deltaHours;
        }
      }

      consumptionByDay.set(day, existing + wh);
    }

    const sorted = Array.from(consumptionByDay.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    return new Plot(
      'Plant Consumption Analytics',
      cmd.metric,
      sorted.map(([day]) => day),
      sorted.map(([, wh]) => wh.toFixed(2)),
    );
  }
}
