import { Injectable } from '@angular/core';
import { ActiveAlarm } from '../../../core/alarm/models/active-alarm.model';
import { ActiveAlarmTableRow } from '../models/active-alarm-table-row.model';

@Injectable({ providedIn: 'root' })
export class AlarmManagementTablePresenterService {
    public toRows(alarms: ActiveAlarm[], resolvingId: string | null): ActiveAlarmTableRow[] {
        return alarms.map((alarm) => {
            const isOpen = alarm.resolutionTime === null;
            const isManaged = !isOpen;
            const isResolving = resolvingId === alarm.id;

            return {
                isManaged,
                id: alarm.id,
                priority: alarm.priority,
                name: alarm.alarmName,
                device: this.getSafeDevice(alarm.deviceId),
                location: this.getSafeLocation(alarm.position),
                status: isOpen ? 'Da gestire' : 'Non da gestire',
                openedAt: alarm.activationTime,
                isResolving,
                isActionDisabled: isManaged || isResolving,
                actionLabel: this.getActionLabel(isResolving, isManaged),
                actionAriaLabel: this.getActionAriaLabel(alarm.alarmName, isManaged),
            };
        });
    }

    private getSafeDevice(deviceId: string | undefined): string {
        const normalizedDeviceId = (deviceId ?? '').trim();
        if (normalizedDeviceId.length > 0) {
            return normalizedDeviceId;
        }

        return '-';
    }

    private getActionLabel(isResolving: boolean, isManaged: boolean): string {
        if (isResolving) {
            return 'GESTIONE...';
        }

        if (isManaged) {
            return 'GESTITO';
        }

        return 'GESTISCI';
    }

    private getActionAriaLabel(alarmName: string, isManaged: boolean): string {
        if (isManaged) {
            return `Allarme gia gestito ${alarmName}`;
        }

        return `Gestisci allarme ${alarmName}`;
    }

    private getSafeLocation(position: string): string {
        const normalizedPosition = position.trim();
        if (normalizedPosition.length > 0) {
            return normalizedPosition;
        }

        return '-';
    }
}
