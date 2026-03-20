import { Injectable, Inject } from '@nestjs/common';
import { AnalyticsStrategy } from '../analytics.strategy';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { Plot } from 'src/analytics/domain/plot.model';
import { VimarStructure } from 'src/analytics/domain/vimar/vimar-structure.model';

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
      return new Plot('Sensor Long Presence', cmd.metric, [], []);
    }

    const snapshots = Array.from(snapshotsMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([timestamp, data]) => ({
        timestamp: new Date(timestamp),
        data: data as VimarStructure,
      }));

    const eventsByDay = new Map<string, number>();
    let presenceStart: Date | undefined = undefined;
    let longPresenceAlreadyCounted = false;

    for (const snapshot of snapshots) {
      for (const room of snapshot.data.rooms) {
        for (const device of room.devices) {
          if (device.id !== cmd.id) continue;

          for (const dp of device.datapoints) {
            if (dp.sfeType !== 'SFE_State_Presence') continue;

            const current: string = dp.value ?? 'NotDetected';

            if (current === 'Detected') {
              if (!presenceStart) {
                presenceStart = snapshot.timestamp;
                longPresenceAlreadyCounted = false;
              } else {
                const durationMs =
                  snapshot.timestamp.getTime() - presenceStart.getTime();

                if (
                  durationMs >= LONG_PRESENCE_THRESHOLD_MS &&
                  !longPresenceAlreadyCounted
                ) {
                  const eventDay = presenceStart.toISOString().slice(0, 10);
                  eventsByDay.set(
                    eventDay,
                    (eventsByDay.get(eventDay) ?? 0) + 1,
                  );
                  longPresenceAlreadyCounted = true;
                }
              }
            } else {
              presenceStart = undefined;
              longPresenceAlreadyCounted = false;
            }
          }
        }
      }
    }

    const sorted = Array.from(eventsByDay.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    return new Plot(
      'Sensor Long Presence',
      cmd.metric,
      sorted.map(([day]) => day),
      sorted.map(([, count]) => count.toString()),
    );
  }
}
