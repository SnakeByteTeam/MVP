import { Injectable, Inject } from '@nestjs/common';
import { AnalyticsStrategy } from '../analytics.strategy';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { Plot } from '../../../domain/plot.model';

const LONG_PRESENCE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minuti

@Injectable()
export class SensorLongPresence implements AnalyticsStrategy {
  constructor(
    @Inject('GET_ANALYTICS_PORT')
    private readonly analyticsPort: GetAnalyticsPort,
  ) {}

  async execute(cmd: GetAnalyticsCmd): Promise<Plot> {
    const startDate = this.getStartDate();

    const snapshotsMap = await this.analyticsPort.getDataBySensorId(
      cmd.id,
      startDate,
    );

    if (snapshotsMap.size === 0) {
      return this.emptyPlot(cmd.metric);
    }

    const snapshots = this.sortSnapshots(snapshotsMap);
    const eventsByDay = this.computeEvents(snapshots);

    return this.buildPlot(cmd.metric, eventsByDay);
  }

  // ---------------- HELPERS ----------------
  private getStartDate(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }

  private emptyPlot(metric: string): Plot {
    return new Plot('Sensor Long Presence Analytics', metric, [], []);
  }

  private sortSnapshots(snapshotsMap: Map<string, any>) {
    return Array.from(snapshotsMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );
  }

  private computeEvents(
    snapshots: [string, any[]][],
  ): Map<string, number> {
    const eventsByDay = new Map<string, number>();

    let presenceStart: Date | undefined;
    let counted = false;

    for (const [timestamp, datapoints] of snapshots) {
      const snapshotTime = new Date(timestamp);

      for (const dp of datapoints) {
        if (!this.isPresence(dp)) continue;

        const state = dp.value ?? 'NotDetected';

        if (state === 'Detected') {
          ({ presenceStart, counted } = this.handleDetected(
            snapshotTime,
            presenceStart,
            counted,
            eventsByDay,
          ));
        } else {
          presenceStart = undefined;
          counted = false;
        }
      }
    }

    return eventsByDay;
  }

  private isPresence(dp: any): boolean {
    return dp.sfeType === 'SFE_State_Presence';
  }

  private handleDetected(
    currentTime: Date,
    presenceStart: Date | undefined,
    counted: boolean,
    eventsByDay: Map<string, number>,
  ): { presenceStart: Date | undefined; counted: boolean } {
    if (!presenceStart) {
      return { presenceStart: currentTime, counted: false };
    }

    const duration =
      currentTime.getTime() - presenceStart.getTime();

    if (duration >= LONG_PRESENCE_THRESHOLD_MS && !counted) {
      const day = presenceStart.toISOString().slice(0, 10);
      eventsByDay.set(day, (eventsByDay.get(day) ?? 0) + 1);
      return { presenceStart, counted: true };
    }

    return { presenceStart, counted };
  }

  private buildPlot(
    metric: string,
    eventsByDay: Map<string, number>,
  ): Plot {
    const sorted = Array.from(eventsByDay.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    return new Plot(
      'Sensor Long Presence Analytics',
      metric,
      sorted.map(([day]) => day),
      sorted.map(([, count]) => count.toString()),
    );
  }
}
