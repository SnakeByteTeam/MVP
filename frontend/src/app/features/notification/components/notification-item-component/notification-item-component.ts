import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NotificationEvent } from '../../models/notification-event.model';
import { ElapsedTimePipe } from '../../../../shared/pipes/elapsed-time.pipe';

@Component({
  selector: 'app-notification-item-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ElapsedTimePipe],
  templateUrl: './notification-item-component.html',
  styleUrl: './notification-item-component.css',
})
export class NotificationItemComponent {
  public readonly notification = input.required<NotificationEvent>();
  public readonly showRemoveAction = input<boolean>(false);
  public readonly removeClicked = output<string>();
  public readonly sentAt = computed(() => this.notification().sentAt);
  public readonly ariaLabel = computed(() => `Notifica: ${this.notification().title}`);

  public onRemove(): void {
    this.removeClicked.emit(this.notification().notificationId);
  }
}