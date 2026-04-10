import { Injectable, inject } from '@angular/core';
import { AlarmRule } from '../../../core/alarm/models/alarm-rule.model';
import { AlarmTimeMapper } from '../mappers/alarm-time.mapper';
import { AlarmConfigTableRow } from '../models/alarm-config-table-row.model';
import { formatAlarmPositionLabel } from '../utils/alarm-position-label.util';

@Injectable({ providedIn: 'root' })
export class AlarmConfigTablePresenterService {
    private readonly alarmTimeMapper = inject(AlarmTimeMapper);

    public toRows(rules: AlarmRule[]): AlarmConfigTableRow[] {
        return rules.map((rule) => ({
            id: rule.id,
            name: rule.name,
            position: formatAlarmPositionLabel(rule.position),
            priority: rule.priority,
            threshold: `${rule.thresholdOperator} ${rule.thresholdValue}`,
            armingTime: this.alarmTimeMapper.toFormTime(rule.armingTime),
            dearmingTime: this.alarmTimeMapper.toFormTime(rule.dearmingTime),
            isEnabled: rule.isArmed,
        }));
    }
}