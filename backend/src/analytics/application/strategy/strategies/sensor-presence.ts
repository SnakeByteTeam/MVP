import { Injectable, Inject } from '@nestjs/common';
import { AnalyticsStrategy } from '../analytics.strategy';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { Plot } from 'src/analytics/domain/plot.model';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';

@Injectable()
export class SensorPresence implements AnalyticsStrategy {
  constructor(
    @Inject('GET_ANALYTICS_PORT')
    private readonly analyticsPort: GetAnalyticsPort,
  ) {}

  async execute(cmd: GetAnalyticsCmd): Promise<Plot> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const snapshotsMap = await this.analyticsPort.getDataBySensorId(
      cmd.id,
      startDate,
    );

    if (snapshotsMap.size === 0) {
      return new Plot('Sensor Presence Analytics', cmd.metric, [], []);
    }

    const snapshots = Array.from(snapshotsMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    const presenceByDay = new Map<string, number>();
    let previousState: string | undefined = undefined;

    for (const [timestamp, datapoints] of snapshots) {
      const day = timestamp.slice(0, 10);

      for (const dp of datapoints) {
        if (dp.sfeType !== 'SFE_State_Presence') continue;

        const current = dp.value ?? 'NotDetected';

        if (previousState === 'NotDetected' && current === 'Detected') {
          presenceByDay.set(day, (presenceByDay.get(day) ?? 0) + 1);
        }

        previousState = current;
      }
    }

    const sorted = Array.from(presenceByDay.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    return new Plot(
      'Sensor Presence Analytics',
      cmd.metric,
      sorted.map(([day]) => day),
      sorted.map(([, count]) => count.toString()),
    );
  }
}
