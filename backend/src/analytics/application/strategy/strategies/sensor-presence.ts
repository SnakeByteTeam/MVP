import { Injectable, Inject } from '@nestjs/common';
import { AnalyticsStrategy } from '../analytics.strategy';
import {
  GetAnalyticsPort,
  GET_ANALYTICS_PORT,
} from '../../ports/out/get-analytics.port';
import { Plot } from '../../../domain/plot.model';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { DatapointValue } from '../../../domain/datapoint-value.model';
import { Series } from 'src/analytics/domain/series.model';

const PRESENCE_SFE_TYPE = 'SFE_State_Presence';
const DETECTED = 'Detected';
const NOT_DETECTED = 'NotDetected';
const DAYS_RANGE = 30;
const TITLE = 'Rilevamento di presenza';
const METRIC = 'sensor-presence';

interface SensorState {
  name: string;
  previousValue: string | undefined;
  presenceByDay: Map<string, number>;
}

@Injectable()
export class SensorPresence implements AnalyticsStrategy {
  constructor(
    @Inject(GET_ANALYTICS_PORT)
    private readonly analyticsPort: GetAnalyticsPort,
  ) {}

  async execute(cmd: GetAnalyticsCmd): Promise<Plot> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - DAYS_RANGE);

    const snapshotsMap = await this.analyticsPort.getDataForSensor(
      cmd.plantId,
      startDate,
    );

    if (snapshotsMap.size === 0) {
      return new Plot(TITLE, METRIC, 'events', [], []);
    }

    const snapshots: [string, DatapointValue[]][] = Array.from(
      snapshotsMap.entries(),
    ).sort(([a], [b]) => a.localeCompare(b));

    const sensorState = new Map<string, SensorState>();

    for (const [timestamp, datapoints] of snapshots) {
      const day = timestamp.slice(0, 10);

      for (const dp of datapoints) {
        if (dp.sfeType !== PRESENCE_SFE_TYPE) continue;

        const state = this.getOrCreateSensorState(
          sensorState,
          dp.datapointId,
          dp.name ?? dp.datapointId, // fallback all'id se name è undefined
        );
        const current = dp.value ?? NOT_DETECTED;

        if (state.previousValue === NOT_DETECTED && current === DETECTED) {
          state.presenceByDay.set(day, (state.presenceByDay.get(day) ?? 0) + 1);
        }

        state.previousValue = current;
      }
    }

    const allDays = new Set<string>();
    for (const { presenceByDay } of sensorState.values()) {
      for (const day of presenceByDay.keys()) {
        allDays.add(day);
      }
    }
    const labels: string[] = Array.from(allDays).sort();

    const entries: [string, SensorState][] = Array.from(sensorState.entries());
    const series: Series[] = entries.map(
      ([sensorId, state]: [string, SensorState]) => {
        const data: number[] = labels.map(
          (day: string): number => state.presenceByDay.get(day) ?? 0,
        );
        return new Series(sensorId, state.name, data);
      },
    );

    return new Plot(TITLE, METRIC, 'events', labels, series);
  }

  private getOrCreateSensorState(
    sensorState: Map<string, SensorState>,
    sensorId: string,
    name: string,
  ): SensorState {
    const existing = sensorState.get(sensorId);
    if (existing !== undefined) {
      return existing;
    }
    const created: SensorState = {
      name,
      previousValue: undefined,
      presenceByDay: new Map(),
    };
    sensorState.set(sensorId, created);
    return created;
  }
}
