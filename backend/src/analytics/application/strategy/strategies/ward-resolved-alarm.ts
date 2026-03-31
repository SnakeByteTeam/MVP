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
const METRIC = 'ward-resolved-alarm';
const TITLE = 'Allarmi inviati e risolti nel reparto';
const UNIT = 'allarmi';

@Injectable()
export class WardResolvedAlarm implements AnalyticsStrategy {
  constructor(
    @Inject(GET_ANALYTICS_PORT)
    private readonly analyticsPort: GetAnalyticsPort,
  ) {}

  async execute(cmd: GetAnalyticsCmd): Promise<Plot> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - DAYS_RANGE);

    const [totalByDay, resolvedByDay] = await Promise.all([
      this.analyticsPort.getAlarmsForWard(cmd.plantId, startDate, false),
      this.analyticsPort.getAlarmsForWard(cmd.plantId, startDate, true),
    ]);

    const allDaysSet = new Set<string>([
      ...totalByDay.keys(),
      ...resolvedByDay.keys(),
    ]);

    if (allDaysSet.size === 0) {
      return new Plot(TITLE, METRIC, UNIT, [], []);
    }

    const labels: string[] = Array.from(allDaysSet).sort((a, b) =>
      a.localeCompare(b),
    );

    const totalData: number[] = labels.map(
      (day: string): number => totalByDay.get(day) ?? 0,
    );
    const resolvedData: number[] = labels.map(
      (day: string): number => resolvedByDay.get(day) ?? 0,
    );

    const series: Series[] = [
      new Series('total', 'Total Alarms', totalData),
      new Series('resolved', 'Resolved Alarms', resolvedData),
    ];

    return new Plot(TITLE, METRIC, UNIT, labels, series);
  }
}
