import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NotificationEvent } from '../../models/notification-event.model';
import { ElapsedTimePipe } from '../../../../shared/pipes/elapsed-time.pipe';
import { AlarmPriorityIndicatorComponent } from '../../../../shared/components/alarm-table/alarm-priority-indicator.component';
import {
  extractPriorityFromNotificationTitle,
  stripPriorityFromNotificationTitle,
} from '../../../../core/notification/utils/notification-priority-display.util';

@Component({
  selector: 'app-notification-item-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ElapsedTimePipe, AlarmPriorityIndicatorComponent],
  templateUrl: './notification-item-component.html',
  styleUrl: './notification-item-component.css',
})
export class NotificationItemComponent {
  public readonly notification = input.required<NotificationEvent>();
  public readonly showRemoveAction = input<boolean>(false);
  public readonly removeClicked = output<string>();
  public readonly sentAt = computed(() => this.notification().sentAt);
  public readonly isResolved = computed(() => {
    const eventType = this.notification().eventType;
    if (eventType === 'resolved') {
      return true;
    }

    return this.notification().title.trim().toLowerCase().includes('allarme risolto');
  });
  public readonly priority = computed(() =>
    extractPriorityFromNotificationTitle(this.notification().title)
  );
  public readonly displayTitle = computed(() =>
    stripPriorityFromNotificationTitle(this.notification().title) || this.notification().title
  );
  public readonly ariaLabel = computed(() => `Notifica: ${this.displayTitle()}`);

  public onRemove(): void {
    this.removeClicked.emit(this.notification().notificationId);
  }
}