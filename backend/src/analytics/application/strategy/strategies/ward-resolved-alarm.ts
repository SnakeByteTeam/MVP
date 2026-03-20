import { Injectable, Inject } from '@nestjs/common';
import { AnalyticsStrategy } from '../analytics.strategy';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { Plot } from 'src/analytics/domain/plot.model';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';

@Injectable()
export class WardResolvedAlarm implements AnalyticsStrategy {
  constructor(
    @Inject('GET_ANALYTICS_PORT')
    private readonly analyticsPort: GetAnalyticsPort,
  ) {}

  async execute(cmd: GetAnalyticsCmd): Promise<Plot> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const resolvedByDay = await this.analyticsPort.getResolvedAlarmsByWardId(
      cmd.id,
      startDate,
    );

    if (resolvedByDay.size === 0) {
      return new Plot('Ward Resolved Alarm Analytics', cmd.metric, [], []);
    }

    const sorted = Array.from(resolvedByDay.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    return new Plot(
      'Ward Resolved Alarm Analytics',
      cmd.metric,
      sorted.map(([day]) => day),
      sorted.map(([, count]) => count.toString()),
    );
  }
}
