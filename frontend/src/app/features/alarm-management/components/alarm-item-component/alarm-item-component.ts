import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ActiveAlarm } from '../../../../core/alarm/models/active-alarm.model';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import { ElapsedTimePipe } from '../../../../shared/pipes/elapsed-time.pipe';

type PriorityUi = {
  label: string;
  className: string;
  borderClass: string;
  badgeClass: string;
  dotClass: string;
  iconClass: string;
};

const PRIORITY_UI: Readonly<Record<AlarmPriority, PriorityUi>> = {
  [AlarmPriority.WHITE]: {
    label: 'Informativa',
    className: 'priority-white',
    borderClass: 'border-l-slate-400',
    badgeClass: 'bg-slate-100 text-slate-700',
    dotClass: 'bg-slate-400',
    iconClass: 'bg-slate-100 text-slate-600',
  },
  [AlarmPriority.GREEN]: {
    label: 'Bassa',
    className: 'priority-green',
    borderClass: 'border-l-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    dotClass: 'bg-emerald-500',
    iconClass: 'bg-emerald-100 text-emerald-700',
  },
  [AlarmPriority.ORANGE]: {
    label: 'Media',
    className: 'priority-orange',
    borderClass: 'border-l-amber-500',
    badgeClass: 'bg-amber-100 text-amber-700',
    dotClass: 'bg-amber-500',
    iconClass: 'bg-amber-100 text-amber-700',
  },
  [AlarmPriority.RED]: {
    label: 'Alta',
    className: 'priority-red',
    borderClass: 'border-l-rose-500',
    badgeClass: 'bg-rose-100 text-rose-700',
    dotClass: 'bg-rose-500',
    iconClass: 'bg-rose-100 text-rose-700',
  },
};

@Component({
  selector: 'app-alarm-item-component',
  imports: [ElapsedTimePipe],
  templateUrl: './alarm-item-component.html',
  styleUrl: './alarm-item-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AlarmItemComponent {
  public readonly alarm = input.required<ActiveAlarm>();
  public readonly isResolving = input<boolean>(false);
  public readonly resolve = output<string>();

  public readonly priorityUi = computed(() => PRIORITY_UI[this.alarm().priority]);
  public readonly cardClass = computed(() =>
    [
      'alarm-item rounded-2xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm transition-all',
      this.priorityUi().borderClass,
      this.isResolving() ? 'ring-2 ring-sky-100' : '',
    ].join(' ')
  );
  public readonly priorityBadgeClass = computed(
    () => `alarm-item__priority inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${this.priorityUi().badgeClass}`
  );
  public readonly priorityDotClass = computed(
    () => `h-1.5 w-1.5 rounded-full ${this.priorityUi().dotClass}`
  );
  public readonly priorityIconClass = computed(
    () => `flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${this.priorityUi().iconClass}`
  );

  public onResolveClick(): void {
    this.resolve.emit(this.alarm().id);
  }
}
