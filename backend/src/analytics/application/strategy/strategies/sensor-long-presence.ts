import { Injectable, Inject } from '@nestjs/common';
import { AnalyticsStrategy } from '../analytics.strategy';
import {
  GetAnalyticsPort,
  GET_ANALYTICS_PORT,
} from '../../ports/out/get-analytics.port';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { Plot } from '../../../domain/plot.model';
import { DatapointValue } from '../../../domain/datapoint-value.model';
import { Series } from 'src/analytics/domain/series.model';

const LONG_PRESENCE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minuti
const PRESENCE_SFE_TYPE = 'SFE_State_Presence';
const DETECTED = 'Detected';
const DAYS_RANGE = 30;
const TITLE = 'Rilevamento di presenza prolungata';
const METRIC = 'sensor-long-presence';

interface SensorState {
  name: string;
  presenceStart: Date | undefined;
  counted: boolean;
  eventsByDay: Map<string, number>;
}

interface DetectedResult {
  presenceStart: Date | undefined;
  counted: boolean;
}

@Injectable()
export class SensorLongPresence implements AnalyticsStrategy {
  constructor(
    @Inject(GET_ANALYTICS_PORT)
    private readonly analyticsPort: GetAnalyticsPort,
  ) {}

  async execute(cmd: GetAnalyticsCmd): Promise<Plot> {
    const startDate = this.getStartDate();

    const snapshotsMap = await this.analyticsPort.getDataForSensor(
      cmd.plantId,
      startDate,
    );

    if (snapshotsMap.size === 0) {
      return this.emptyPlot();
    }

    const snapshots = this.sortSnapshots(snapshotsMap);
    const { labels, seriesMap } = this.computeSeriesPerSensor(snapshots);

    return this.buildPlot(labels, seriesMap);
  }

  private getStartDate(): Date {
    const d = new Date();
    d.setDate(d.getDate() - DAYS_RANGE);
    return d;
  }

  private emptyPlot(): Plot {
    return new Plot(TITLE, METRIC, 'events', [], []);
  }

  private sortSnapshots(
    snapshotsMap: Map<string, DatapointValue[]>,
  ): [string, DatapointValue[]][] {
    return Array.from(snapshotsMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );
  }

  private computeSeriesPerSensor(snapshots: [string, DatapointValue[]][]): {
    labels: string[];
    seriesMap: Map<string, { name: string; eventsByDay: Map<string, number> }>;
  } {
    const sensorState = new Map<string, SensorState>();

    for (const [timestamp, datapoints] of snapshots) {
      const snapshotTime = new Date(timestamp);

      for (const dp of datapoints) {
        if (dp.sfeType !== PRESENCE_SFE_TYPE) continue;

        const sensorId = dp.datapointId;
        const state = this.getOrCreateSensorState(
          sensorState,
          sensorId,
          dp.name ?? sensorId, // fallback all'id se name è undefined
        );
        const value = dp.value ?? 'NotDetected';

        if (value === DETECTED) {
          const updated = this.handleDetected(
            snapshotTime,
            state.presenceStart,
            state.counted,
            state.eventsByDay,
          );
          state.presenceStart = updated.presenceStart;
          state.counted = updated.counted;
        } else {
          state.presenceStart = undefined;
          state.counted = false;
        }
      }
    }

    const allDays = new Set<string>();
    for (const { eventsByDay } of sensorState.values()) {
      for (const day of eventsByDay.keys()) {
        allDays.add(day);
      }
    }
    const labels = Array.from(allDays).sort();

    const seriesMap = new Map<
      string,
      { name: string; eventsByDay: Map<string, number> }
    >();
    for (const [sensorId, { name, eventsByDay }] of sensorState.entries()) {
      seriesMap.set(sensorId, { name, eventsByDay });
    }

    return { labels, seriesMap };
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
      presenceStart: undefined,
      counted: false,
      eventsByDay: new Map(),
    };
    sensorState.set(sensorId, created);
    return created;
  }

  private handleDetected(
    currentTime: Date,
    presenceStart: Date | undefined,
    counted: boolean,
    eventsByDay: Map<string, number>,
  ): DetectedResult {
    if (presenceStart === undefined) {
      return { presenceStart: currentTime, counted: false };
    }

    const duration = currentTime.getTime() - presenceStart.getTime();

    if (duration >= LONG_PRESENCE_THRESHOLD_MS && !counted) {
      const day = presenceStart.toISOString().slice(0, 10);
      eventsByDay.set(day, (eventsByDay.get(day) ?? 0) + 1);
      return { presenceStart, counted: true };
    }

    return { presenceStart, counted };
  }

  private buildPlot(
    labels: string[],
    seriesMap: Map<string, { name: string; eventsByDay: Map<string, number> }>,
  ): Plot {
    const entries: [
      string,
      { name: string; eventsByDay: Map<string, number> },
    ][] = Array.from(seriesMap.entries());
    const series: Series[] = entries.map(
      ([sensorId, { name, eventsByDay }]: [
        string,
        { name: string; eventsByDay: Map<string, number> },
      ]) => {
        const data: number[] = labels.map(
          (day: string): number => eventsByDay.get(day) ?? 0,
        );
        return new Series(sensorId, name, data);
      },
    );

    return new Plot(TITLE, METRIC, 'events', labels, series);
  }
}
