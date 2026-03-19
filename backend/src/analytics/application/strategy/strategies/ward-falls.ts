import { Injectable, Inject } from '@nestjs/common';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { Plot } from 'src/analytics/domain/plot.model';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { AnalyticsStrategy } from '../analytics.strategy';
import { VimarStructure } from 'src/analytics/domain/vimar/vimar-structure.model';

@Injectable()
export class WardFalls implements AnalyticsStrategy {
  constructor(
    @Inject('GET_ANALYTICS_PORT')
    private readonly analyticsPort: GetAnalyticsPort,
  ) {}

  async execute(cmd: GetAnalyticsCmd): Promise<Plot> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const snapshotsMap = await this.analyticsPort.getDataByWardId(
      cmd.id,
      startDate,
    );

    if (snapshotsMap.size === 0) {
      return new Plot('Ward Falls', cmd.metric, [], []);
    }

    const snapshots = Array.from(snapshotsMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([timestamp, data]) => ({
        timestamp: new Date(timestamp),
        data: data as VimarStructure,
      }));

    const fallsByDay = new Map<string, number>();

    const previousState = new Map<string, string>();

    for (const snapshot of snapshots) {
      const day = snapshot.timestamp.toISOString().slice(0, 10);

      for (const room of snapshot.data.rooms) {
        for (const device of room.devices) {
          if (device.type !== 'SF_FallDetector') continue;

          for (const dp of device.datapoints) {
            if (dp.sfeType !== 'SFE_State_Fall') continue;

            const previous = previousState.get(dp.id);
            const current = dp.value ?? 'NoFall';

            if (previous === 'NoFall' && current === 'Fall') {
              fallsByDay.set(day, (fallsByDay.get(day) ?? 0) + 1);
            }

            previousState.set(dp.id, current);
          }
        }
      }
    }

    const sorted = Array.from(fallsByDay.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    return new Plot(
      'Ward Falls',
      cmd.metric,
      sorted.map(([day]) => day),
      sorted.map(([, count]) => count.toString()),
    );
  }
}
