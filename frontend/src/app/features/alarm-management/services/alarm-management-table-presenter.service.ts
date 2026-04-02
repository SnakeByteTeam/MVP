import { Injectable } from '@angular/core';
import { ActiveAlarm } from '../../../core/alarm/models/active-alarm.model';
import { ActiveAlarmTableRow } from '../models/active-alarm-table-row.model';

@Injectable({ providedIn: 'root' })
export class AlarmManagementTablePresenterService {
    public toRows(alarms: ActiveAlarm[], resolvingId: string | null): ActiveAlarmTableRow[] {
        return alarms.map((alarm) => ({
            id: alarm.id,
            priority: alarm.priority,
            name: alarm.alarmName,
            device: alarm.alarmRuleId,
            location: this.getSafeLocation(alarm.position),
            status: alarm.resolutionTime ? 'Chiuso' : 'Aperto',
            openedAt: this.toShortTime(alarm.activationTime),
            closedAt: this.toShortTime(alarm.resolutionTime),
            manager: alarm.userId === null ? '-' : String(alarm.userId),
            isResolving: resolvingId === alarm.id,
        }));
    }

    private getSafeLocation(position: string): string {
        const normalizedPosition = position.trim();
        if (normalizedPosition.length > 0) {
            return normalizedPosition;
        }

        return '-';
    }

    private toShortTime(dateTime: string | null): string {
        if (dateTime === null) {
            return '-';
        }

        const parsed = Date.parse(dateTime);
        if (Number.isNaN(parsed)) {
            return dateTime.slice(0, 5);
        }

        return new Date(parsed).toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    }
}
