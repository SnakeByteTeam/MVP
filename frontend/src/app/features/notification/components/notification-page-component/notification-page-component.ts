import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationListVm } from '../../models/notification-list-vm.model';
import { NotificationService } from '../../services/notification.service';
import { NotificationItemComponent } from '../notification-item-component/notification-item-component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notification-page-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, NotificationItemComponent],
  providers: [NotificationService],
  templateUrl: './notification-page-component.html',
  styleUrl: './notification-page-component.css',
})
export class NotificationPageComponent {
  private readonly notificationService = inject(NotificationService);

  public readonly vm$: Observable<NotificationListVm> = this.notificationService.vm$;
  public readonly skeletonRows = [0, 1, 2];

  public onNotificationRemoved(notificationId: string): void {
    this.notificationService.removeNotification(notificationId);
  }

  public onClearAllNotifications(vm: NotificationListVm): void {
    this.notificationService.clearAllNotifications(vm.notifications);
  }

  public unreadSummaryLabel(unreadCount: number): string {
    if (unreadCount === 1) {
      return '1 notifica non letta';
    }

    return `${unreadCount} notifiche non lette`;
  }
}