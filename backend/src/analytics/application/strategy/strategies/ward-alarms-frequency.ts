import { Injectable, Inject } from '@nestjs/common';
import { AnalyticsStrategy } from '../analytics.strategy';
import {
  GetAnalyticsPort,
  GET_ANALYTICS_PORT,
} from '../../ports/out/get-analytics.port';
import { Plot } from '../../../domain/plot.model';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { Series } from 'src/analytics/domain/series.model';

const DAYS_RANGE = 30;
const METRIC = 'ward-alarms-frequency';

@Injectable()
export class WardAlarmsFrequency implements AnalyticsStrategy {
  constructor(
    @Inject(GET_ANALYTICS_PORT)
    private readonly analyticsPort: GetAnalyticsPort,
  ) {}

  async execute(cmd: GetAnalyticsCmd): Promise<Plot> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - DAYS_RANGE);

    const alarmsByDay = await this.analyticsPort.getAlarmsForWard(
      cmd.plantId,
      startDate,
      false,
    );

    if (alarmsByDay.size === 0) {
      return new Plot(
        'Ward Alarms Frequency Analytics',
        METRIC,
        'alarms',
        [],
        [],
      );
    }

    const labels: string[] = Array.from(alarmsByDay.keys()).sort((a, b) =>
      a.localeCompare(b),
    );

    const data: number[] = labels.map(
      (day: string): number => alarmsByDay.get(day) ?? 0,
    );
    const series: Series[] = [new Series('ward-alarms', 'Alarms', data)];

    return new Plot(
      'Ward Alarms Frequency Analytics',
      METRIC,
      'alarms',
      labels,
      series,
    );
  }
}
