import { Injectable, Inject } from '@nestjs/common';
import { AnalyticsStrategy } from '../analytics.strategy';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { Plot } from '../../../domain/plot.model';
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

    const resolvedByDay = await this.analyticsPort.getAlarmsForWard(
      cmd.id,
      startDate,
      true,
    );

    const sentByDay = await this.analyticsPort.getAlarmsForWard(
      cmd.id,
      startDate,
      false,
    );

    const allDays = Array.from(
      new Set([...resolvedByDay.keys(), ...sentByDay.keys()]),
    ).sort((a, b) => {
      const timeA = Date.parse(a);
      const timeB = Date.parse(b);
      return timeA - timeB;
    });

    if (allDays.length === 0) {
      return new Plot('Ward Resolved Alarm Analytics', cmd.metric, '', [], []);
    }

    const series: Record<string, string[]> = {
      resolved: allDays.map((day) => (resolvedByDay.get(day) ?? 0).toString()),
    };

    return new Plot(
      'Ward Resolved Alarm Analytics',
      cmd.metric,
      '',
      allDays,
      allDays.map((day) => (sentByDay.get(day) ?? 0).toString()),
      series,
    );
  }
}
