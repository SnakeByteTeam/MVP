import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ActiveAlarm } from '../../../../core/alarm/models/active-alarm.model';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import { ElapsedTimePipe } from '../../../../shared/pipes/elapsed-time.pipe';

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

  public readonly priorityLabel = computed(() => {
    const priority = this.alarm().priority;

    if (priority === AlarmPriority.RED) {
      return 'Alta';
    }

    if (priority === AlarmPriority.ORANGE) {
      return 'Media';
    }

    if (priority === AlarmPriority.GREEN) {
      return 'Bassa';
    }

    return 'Informativa';
  });

  public readonly priorityClass = computed(() => {
    const priority = this.alarm().priority;

    if (priority === AlarmPriority.RED) {
      return 'priority-red';
    }

    if (priority === AlarmPriority.ORANGE) {
      return 'priority-orange';
    }

    if (priority === AlarmPriority.GREEN) {
      return 'priority-green';
    }

    return 'priority-white';
  });

  public onResolveClick(): void {
    this.resolve.emit(this.alarm().id);
  }
}
