import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';

type PriorityUi = {
    readonly label: string;
    readonly bubbleClass: string;
    readonly symbolClass: string;
    readonly symbol: string;
};

const PRIORITY_UI: Readonly<Record<AlarmPriority, PriorityUi>> = {
    [AlarmPriority.WHITE]: {
        label: 'Informativa',
        bubbleClass: 'border-slate-400 text-slate-700',
        symbolClass: 'text-slate-600',
        symbol: 'i',
    },
    [AlarmPriority.GREEN]: {
        label: 'Bassa',
        bubbleClass: 'border-emerald-500 text-emerald-700',
        symbolClass: 'text-emerald-600',
        symbol: '•',
    },
    [AlarmPriority.ORANGE]: {
        label: 'Media',
        bubbleClass: 'border-amber-500 text-amber-700',
        symbolClass: 'text-amber-600',
        symbol: '!',
    },
    [AlarmPriority.RED]: {
        label: 'Alta',
        bubbleClass: 'border-rose-500 text-rose-700',
        symbolClass: 'text-rose-600',
        symbol: '▲',
    },
};

@Component({
    selector: 'app-alarm-priority-indicator',
    templateUrl: './alarm-priority-indicator.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmPriorityIndicatorComponent {
    public readonly priority = input.required<AlarmPriority>();

    public readonly ui = computed(() => PRIORITY_UI[this.priority()]);
}
