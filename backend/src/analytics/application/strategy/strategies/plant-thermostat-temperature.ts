import { Injectable, Inject } from '@nestjs/common';
import { AnalyticsStrategy } from '../analytics.strategy';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { Plot } from '../../../domain/plot.model';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';

@Injectable()
export class PlantThermostatTemperature implements AnalyticsStrategy {
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
      return new Plot(
        'Plant Thermostat Temperature Analytics',
        cmd.metric,
        '',
        [],
        [],
      );
    }

    const snapshots = Array.from(snapshotsMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    const tempByDay = new Map<string, { sum: number; count: number }>();

    for (const [timestamp, datapoints] of snapshots) {
      const day = timestamp.slice(0, 10);

      for (const dp of datapoints) {
        if (dp.sfeType !== 'SFE_State_Temperature') continue;

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

    return new Plot(
      'Plant Thermostat Temperature Analytics',
      cmd.metric,
      '°C',
      sorted.map(([day]) => day),
      sorted.map(([, { sum, count }]) => (sum / count).toFixed(1)),
    );
  }
}
