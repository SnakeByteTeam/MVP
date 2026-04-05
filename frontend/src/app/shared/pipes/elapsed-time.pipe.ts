import { Pipe, PipeTransform } from '@angular/core';

const MILLISECONDS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * MINUTES_PER_HOUR;
const MILLISECONDS_PER_DAY = MILLISECONDS_PER_HOUR * HOURS_PER_DAY;

@Pipe({ name: 'elapsedTime', standalone: true, pure: true })
export class ElapsedTimePipe implements PipeTransform {
  transform(sentAt: string, referenceTimestampMs: number = Date.now()): string {
    const parsedTimestamp = Date.parse(sentAt);
    if (Number.isNaN(parsedTimestamp)) {
      return sentAt;
    }

    const deltaMs = referenceTimestampMs - parsedTimestamp;
    if (deltaMs < 0) {
      return 'tra poco';
    }

    if (deltaMs < MILLISECONDS_PER_DAY) {
      return this.toElapsedHoursAndMinutes(deltaMs);
    }

    return this.toElapsedDays(deltaMs);
  }

  private toElapsedHoursAndMinutes(deltaMs: number): string {
    const elapsedHours = Math.floor(deltaMs / MILLISECONDS_PER_HOUR);
    const elapsedMinutes = Math.floor((deltaMs % MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE);

    return `${this.padTwoDigits(elapsedHours)}:${this.padTwoDigits(elapsedMinutes)}`;
  }

  private toElapsedDays(deltaMs: number): string {
    const elapsedDays = Math.floor(deltaMs / MILLISECONDS_PER_DAY);

    if (elapsedDays === 1) {
      return '1 giorno fa';
    }

    return `${elapsedDays} giorni fa`;
  }

  private padTwoDigits(value: number): string {
    return value.toString().padStart(2, '0');
  }
}
