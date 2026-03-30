import { Injectable, Inject } from '@nestjs/common';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { Plot } from '../../../domain/plot.model';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { AnalyticsStrategy } from '../analytics.strategy';

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
      return new Plot('Ward Falls Analytics', cmd.metric, '', [], []);
    }

    const snapshots = Array.from(snapshotsMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    const fallsByDay = new Map<string, number>();
    const previousState = new Map<string, string>();

    for (const [timestamp, datapoints] of snapshots) {
      const day = timestamp.slice(0, 10);

      for (const dp of datapoints) {
        if (dp.sfeType !== 'SFE_State_Fall') continue;

        const previous = previousState.get(dp.datapointId);
        const current = dp.value ?? 'NoFall';

        if (previous === 'NoFall' && current === 'Fall') {
          fallsByDay.set(day, (fallsByDay.get(day) ?? 0) + 1);
        }

        previousState.set(dp.datapointId, current);
      }
    }

    const sorted = Array.from(fallsByDay.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    return new Plot(
      'Ward Falls Analytics',
      cmd.metric,
      '',
      sorted.map(([day]) => day),
      sorted.map(([, count]) => count.toString()),
    );
  }
}
