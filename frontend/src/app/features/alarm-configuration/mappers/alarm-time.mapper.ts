import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AlarmTimeMapper {
    public toFormTime(value: Date | string): string {
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return this.toHourMinute(value.toISOString());
        }

        const stringValue = String(value).trim();
        if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(stringValue)) {
            return stringValue;
        }

        const hhmmss = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.exec(stringValue);
        if (hhmmss) {
            return `${hhmmss[1]}:${hhmmss[2]}`;
        }

        return this.toHourMinute(stringValue);
    }

    private toHourMinute(value: string): string {
        const match = /T([01]\d|2[0-3]):([0-5]\d)/.exec(value);
        if (!match) {
            return value.slice(0, 5);
        }

        return `${match[1]}:${match[2]}`;
    }
}