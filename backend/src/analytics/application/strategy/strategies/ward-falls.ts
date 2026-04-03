import { Injectable, Inject } from '@nestjs/common';
import {
  GetAnalyticsPort,
  GET_ANALYTICS_PORT,
} from '../../ports/out/get-analytics.port';
import { Plot } from '../../../domain/plot.model';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { AnalyticsStrategy } from '../analytics.strategy';
import { DatapointValue } from '../../../domain/datapoint-value.model';
import { Series } from 'src/analytics/domain/series.model';

<<<<<<< HEAD
const FALL_SFE_TYPE = 'SFE_State_Fall';
const FALL = 'Fall';
const NO_FALL = 'NoFall';
=======
const FALL_SFE_TYPE = 'SFE_State_ManDown';
const FALL = 'True';
const NO_FALL = 'False';
>>>>>>> prova_integrazione
const DAYS_RANGE = 30;
const METRIC = 'ward-falls';
const TITLE = 'Frequenza delle cadute rilevate nel reparto';
const UNIT = 'allarmi';

@Injectable()
export class WardFalls implements AnalyticsStrategy {
  constructor(
    @Inject(GET_ANALYTICS_PORT)
    private readonly analyticsPort: GetAnalyticsPort,
  ) {}

  async execute(cmd: GetAnalyticsCmd): Promise<Plot> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - DAYS_RANGE);

    const snapshotsMap = await this.analyticsPort.getDataForWard(
      cmd.plantId,
      startDate,
    );

    if (snapshotsMap.size === 0) {
      return new Plot(TITLE, METRIC, UNIT, [], []);
    }

    const snapshots: [string, DatapointValue[]][] = Array.from(
      snapshotsMap.entries(),
    ).sort(([a], [b]) => a.localeCompare(b));

    const fallsByDay = new Map<string, number>();
    const previousState = new Map<string, string>();

    for (const [timestamp, datapoints] of snapshots) {
      const day = timestamp.slice(0, 10);

      for (const dp of datapoints) {
        if (dp.sfeType !== FALL_SFE_TYPE) continue;

        const previous = previousState.get(dp.datapointId);
        const current = dp.value ?? NO_FALL;

        if (previous === NO_FALL && current === FALL) {
          fallsByDay.set(day, (fallsByDay.get(day) ?? 0) + 1);
        }

        previousState.set(dp.datapointId, current);
      }
    }

    if (fallsByDay.size === 0) {
      return new Plot(TITLE, METRIC, UNIT, [], []);
    }

    const labels: string[] = Array.from(fallsByDay.keys()).sort((a, b) =>
      a.localeCompare(b),
    );

    const data: number[] = labels.map(
      (day: string): number => fallsByDay.get(day) ?? 0,
    );
    const series: Series[] = [new Series('', '', data)];

    return new Plot(TITLE, METRIC, UNIT, labels, series);
  }
}
