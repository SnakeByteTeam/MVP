import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
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
  public readonly sentAt = computed(() => this.notification().sentAt);
}
