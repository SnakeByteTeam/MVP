import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ActiveAlarm } from '../../../../core/alarm/models/active-alarm.model';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import { ElapsedTimePipe } from '../../../../shared/pipes/elapsed-time.pipe';

type PriorityUi = {
  label: string;
  className: string;
};

const PRIORITY_UI: Readonly<Record<AlarmPriority, PriorityUi>> = {
  [AlarmPriority.WHITE]: { label: 'Informativa', className: 'priority-white' },
  [AlarmPriority.GREEN]: { label: 'Bassa', className: 'priority-green' },
  [AlarmPriority.ORANGE]: { label: 'Media', className: 'priority-orange' },
  [AlarmPriority.RED]: { label: 'Alta', className: 'priority-red' },
};

@Component({
  selector: 'app-alarm-item-component',
  imports: [ElapsedTimePipe],
  templateUrl: './alarm-item-component.html',
  styleUrl: './alarm-item-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmItemComponent {
  public readonly alarm = input.required<ActiveAlarm>();
  public readonly isResolving = input<boolean>(false);
  public readonly resolve = output<string>();

  public readonly priorityUi = computed(() => PRIORITY_UI[this.alarm().priority]);

  public onResolveClick(): void {
    this.resolve.emit(this.alarm().id);
  }
}
