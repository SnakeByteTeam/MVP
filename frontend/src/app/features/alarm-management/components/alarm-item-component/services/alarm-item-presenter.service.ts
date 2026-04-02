import { Injectable } from '@angular/core';
import { ActiveAlarm } from '../../../../../core/alarm/models/active-alarm.model';
import { AlarmPriority } from '../../../../../core/alarm/models/alarm-priority.enum';
import {
    AlarmItemPriorityUiMap,
    AlarmItemViewModel,
} from '../models/alarm-item-view.model';

const BASE_CARD_CLASS =
    'alarm-item rounded-2xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm transition-all';
const RESOLVING_RING_CLASS = 'ring-2 ring-sky-100';

const PRIORITY_UI: AlarmItemPriorityUiMap = {
    [AlarmPriority.WHITE]: {
        label: 'Informativa',
        borderClass: 'border-l-slate-400',
        badgeClass: 'bg-slate-100 text-slate-700',
        dotClass: 'bg-slate-400',
        iconClass: 'bg-slate-100 text-slate-600',
    },
    [AlarmPriority.GREEN]: {
        label: 'Bassa',
        borderClass: 'border-l-emerald-500',
        badgeClass: 'bg-emerald-100 text-emerald-700',
        dotClass: 'bg-emerald-500',
        iconClass: 'bg-emerald-100 text-emerald-700',
    },
    [AlarmPriority.ORANGE]: {
        label: 'Media',
        borderClass: 'border-l-amber-500',
        badgeClass: 'bg-amber-100 text-amber-700',
        dotClass: 'bg-amber-500',
        iconClass: 'bg-amber-100 text-amber-700',
    },
    [AlarmPriority.RED]: {
        label: 'Alta',
        borderClass: 'border-l-rose-500',
        badgeClass: 'bg-rose-100 text-rose-700',
        dotClass: 'bg-rose-500',
        iconClass: 'bg-rose-100 text-rose-700',
    },
};

@Injectable({ providedIn: 'root' })
export class AlarmItemPresenterService {
    public toViewModel(alarm: ActiveAlarm, isResolving: boolean): AlarmItemViewModel {
        const priorityUi = PRIORITY_UI[alarm.priority];
        const safeAlarmName = this.getSafeAlarmName(alarm.alarmName);

        return {
            id: alarm.id,
            alarmName: alarm.alarmName,
            alarmRuleId: alarm.alarmRuleId,
            activationTime: alarm.activationTime,
            isResolving,
            priorityLabel: priorityUi.label,
            cardClass: this.buildCardClass(priorityUi.borderClass, isResolving),
            priorityBadgeClass: this.buildPriorityBadgeClass(priorityUi.badgeClass),
            priorityDotClass: this.buildPriorityDotClass(priorityUi.dotClass),
            priorityIconClass: this.buildPriorityIconClass(priorityUi.iconClass),
            articleAriaLabel: `Allarme ${safeAlarmName}`,
            resolveButtonAriaLabel: isResolving
                ? `Risoluzione in corso per ${safeAlarmName}`
                : `Risolvi allarme ${safeAlarmName}`,
            resolveButtonText: isResolving ? 'Risoluzione...' : 'Risolvi',
            resolvingStatusText: 'Operazione in corso',
            waitingStatusText: 'In attesa di risoluzione',
        };
    }

    private buildCardClass(borderClass: string, isResolving: boolean): string {
        return [BASE_CARD_CLASS, borderClass, isResolving ? RESOLVING_RING_CLASS : '']
            .filter((value) => value.length > 0)
            .join(' ');
    }

    private buildPriorityBadgeClass(badgeClass: string): string {
        return `alarm-item__priority inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`;
    }

    private buildPriorityDotClass(dotClass: string): string {
        return `h-1.5 w-1.5 rounded-full ${dotClass}`;
    }

    private buildPriorityIconClass(iconClass: string): string {
        return `flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${iconClass}`;
    }

    private getSafeAlarmName(alarmName: string): string {
        const normalizedName = alarmName.trim();
        if (normalizedName.length > 0) {
            return normalizedName;
        }

        return 'senza nome';
    }
}