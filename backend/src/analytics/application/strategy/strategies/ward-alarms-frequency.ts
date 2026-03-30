import { Injectable, Inject } from '@nestjs/common';
import { AnalyticsStrategy } from '../analytics.strategy';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { Plot } from '../../../domain/plot.model';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';

@Injectable()
export class WardAlarmsFrequency implements AnalyticsStrategy {
  constructor(
    @Inject('GET_ANALYTICS_PORT')
    private readonly analyticsPort: GetAnalyticsPort,
  ) {}

  async execute(cmd: GetAnalyticsCmd): Promise<Plot> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const alarmsByDay = await this.analyticsPort.getAlarmsForWard(
      cmd.id,
      startDate,
      false,
    );

    if (alarmsByDay.size === 0) {
      return new Plot(
        'Ward Alarms Frequency Analytics',
        cmd.metric,
        '',
        [],
        [],
      );
    }

    const sorted = Array.from(alarmsByDay.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    return new Plot(
      'Ward Alarms Frequency Analytics',
      cmd.metric,
      '',
      sorted.map(([day]) => day),
      sorted.map(([, count]) => count.toString()),
    );
  }
}
