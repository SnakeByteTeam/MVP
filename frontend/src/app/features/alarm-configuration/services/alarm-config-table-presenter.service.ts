import { Injectable, inject } from '@angular/core';
import { AlarmRule } from '../../../core/alarm/models/alarm-rule.model';
import { AlarmTimeMapper } from '../mappers/alarm-time.mapper';
import { AlarmConfigTableRow } from '../models/alarm-config-table-row.model';
import { AlarmDeviceCatalogService } from './alarm-device-catalog.service';

@Injectable({ providedIn: 'root' })
export class AlarmConfigTablePresenterService {
    private readonly alarmTimeMapper = inject(AlarmTimeMapper);
    private readonly deviceCatalog = inject(AlarmDeviceCatalogService);

    public toRows(rules: AlarmRule[]): AlarmConfigTableRow[] {
        return rules.map((rule) => ({
            id: rule.id,
            name: rule.name,
            apartment: this.toApartmentLabel(rule.deviceId),
            device: this.toDeviceLabel(rule.deviceId),
            priority: rule.priority,
            threshold: `${rule.thresholdOperator} ${rule.thresholdValue}`,
            armingTime: this.alarmTimeMapper.toFormTime(rule.armingTime),
            dearmingTime: this.alarmTimeMapper.toFormTime(rule.dearmingTime),
            isEnabled: rule.isArmed,
        }));
    }

    private toApartmentLabel(deviceId: string): string {
        return this.deviceCatalog.getApartmentNameByDeviceId(deviceId) ?? '-';
    }

    private toDeviceLabel(deviceId: string): string {
        const normalized = deviceId.trim();
        if (normalized.length === 0) {
            return '-';
        }

        return normalized;
    }
}