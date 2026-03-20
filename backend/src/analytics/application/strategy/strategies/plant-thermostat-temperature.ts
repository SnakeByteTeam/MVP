import { Injectable, Inject } from '@nestjs/common';
import { AnalyticsStrategy } from '../analytics.strategy';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { Plot } from 'src/analytics/domain/plot.model';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { VimarStructure } from 'src/analytics/domain/vimar/vimar-structure.model';

@Injectable()
export class PlantThermostatTemperature implements AnalyticsStrategy {
  constructor(
    @Inject('GET_ANALYTICS_PORT')
    private readonly analyticsPort: GetAnalyticsPort,
  ) {}

  async execute(cmd: GetAnalyticsCmd): Promise<Plot> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const snapshotsMap = await this.analyticsPort.getDataByDatapointId(
      cmd.id,
      startDate,
    );

    if (snapshotsMap.size === 0) {
      return new Plot(
        'Plant Thermostat Temperature Analytics',
        cmd.metric,
        [],
        [],
      );
    }

    const snapshots = Array.from(snapshotsMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([timestamp, data]) => ({
        timestamp: new Date(timestamp),
        data: data as VimarStructure,
      }));

    const tempByDay = new Map<string, { sum: number; count: number }>();

    for (const snapshot of snapshots) {
      const day = snapshot.timestamp.toISOString().slice(0, 10);

      for (const room of snapshot.data.rooms) {
        for (const device of room.devices) {
          if (device.type !== 'SF_Thermostat') continue;

          for (const dp of device.datapoints) {
            if (dp.sfeType !== 'SFE_State_Temperature') continue;
            if (dp.value === undefined) continue;

            const temp = parseFloat(dp.value);
            if (isNaN(temp)) continue;

            const existing = tempByDay.get(day) ?? { sum: 0, count: 0 };
            tempByDay.set(day, {
              sum: existing.sum + temp,
              count: existing.count + 1,
            });
          }
        }
      }
    }

    const sorted = Array.from(tempByDay.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    return new Plot(
      'Plant Thermostat Temperature Analytics',
      cmd.metric,
      sorted.map(([day]) => day),
      sorted.map(([, { sum, count }]) => (sum / count).toFixed(1)),
    );
  }
}
