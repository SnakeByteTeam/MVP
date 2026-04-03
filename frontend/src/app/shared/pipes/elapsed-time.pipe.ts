import { Pipe, PipeTransform } from '@angular/core';

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
const SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY;

@Pipe({ name: 'elapsedTime', standalone: true, pure: true })
export class ElapsedTimePipe implements PipeTransform {
  transform(sentAt: string): string {
    const parsedTimestamp = Date.parse(sentAt);
    if (Number.isNaN(parsedTimestamp)) {
      return sentAt;
    }

    const deltaMs = Date.now() - parsedTimestamp;
    if (deltaMs < 0) {
      return 'tra poco';
    }

    const deltaSeconds = Math.floor(deltaMs / 1000);
    if (deltaSeconds < SECONDS_PER_MINUTE) {
      return `${deltaSeconds}s fa`;
    }

    const deltaMinutes = Math.floor(deltaSeconds / SECONDS_PER_MINUTE);
    if (deltaSeconds < SECONDS_PER_HOUR) {
      return `${deltaMinutes}m fa`;
    }

    const deltaHours = Math.floor(deltaSeconds / SECONDS_PER_HOUR);
    if (deltaSeconds < SECONDS_PER_DAY) {
      const remainingMinutes = deltaMinutes % MINUTES_PER_HOUR;
      if (remainingMinutes > 0) {
        return `${deltaHours}h ${remainingMinutes}m fa`;
      }

      return `${deltaHours}h fa`;
    }

    const deltaDays = Math.floor(deltaSeconds / SECONDS_PER_DAY);
    return `${deltaDays}g fa`;
  }
}
