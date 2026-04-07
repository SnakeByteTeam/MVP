import { Injectable, inject } from '@angular/core';
import { AlarmRule } from '../../../core/alarm/models/alarm-rule.model';
import { AlarmTimeMapper } from '../mappers/alarm-time.mapper';
import { AlarmConfigTableRow } from '../models/alarm-config-table-row.model';

@Injectable({ providedIn: 'root' })
export class AlarmConfigTablePresenterService {
    private readonly alarmTimeMapper = inject(AlarmTimeMapper);

    public toRows(rules: AlarmRule[]): AlarmConfigTableRow[] {
        return rules.map((rule) => ({
            id: rule.id,
            name: rule.name,
            position: this.toPositionLabel(rule.position),
            priority: rule.priority,
            threshold: `${rule.thresholdOperator} ${rule.thresholdValue}`,
            armingTime: this.alarmTimeMapper.toFormTime(rule.armingTime),
            dearmingTime: this.alarmTimeMapper.toFormTime(rule.dearmingTime),
            isEnabled: rule.isArmed,
        }));
    }

    private toPositionLabel(position: string): string {
        const normalized = position
            .replaceAll(/\s*-\s*/g, ' - ')
            .trim();

        if (normalized.length === 0) {
            return '-';
        }

        return normalized;
    }
}