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
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const snapshotsMap = await this.analyticsPort.getDataBySensorId(
      cmd.id,
      startDate,
    );

    if (snapshotsMap.size === 0) {
      return new Plot('Sensor Long Presence Analytics', cmd.metric, [], []);
    }

    const snapshots = Array.from(snapshotsMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    const eventsByDay = new Map<string, number>();
    let presenceStart: Date | undefined = undefined;
    let longPresenceAlreadyCounted = false;

    for (const [timestamp, datapoints] of snapshots) {
      const snapshotTime = new Date(timestamp);

      for (const dp of datapoints) {
        if (dp.sfeType !== 'SFE_State_Presence') continue;

        const current = dp.value ?? 'NotDetected';

        if (current === 'Detected') {
          if (!presenceStart) {
            presenceStart = snapshotTime;
            longPresenceAlreadyCounted = false;
          } else {
            const durationMs = snapshotTime.getTime() - presenceStart.getTime();

            if (
              durationMs >= LONG_PRESENCE_THRESHOLD_MS &&
              !longPresenceAlreadyCounted
            ) {
              const eventDay = presenceStart.toISOString().slice(0, 10);
              eventsByDay.set(eventDay, (eventsByDay.get(eventDay) ?? 0) + 1);
              longPresenceAlreadyCounted = true;
            }
          }
        } else {
          presenceStart = undefined;
          longPresenceAlreadyCounted = false;
        }
      }
    }

    const sorted = Array.from(eventsByDay.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    return new Plot(
      'Sensor Long Presence Analytics',
      cmd.metric,
      sorted.map(([day]) => day),
      sorted.map(([, count]) => count.toString()),
    );
  }
}
