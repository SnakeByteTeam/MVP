import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificationEvent } from '../../models/notification-event.model';

@Component({
  selector: 'app-notification-topbar-panel-component',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: './notification-topbar-panel-component.html',
  styleUrl: './notification-topbar-panel-component.css',
})
export class NotificationTopbarPanelComponent {
  @Input() notifications: ReadonlyArray<NotificationEvent> = [];
  @Output() viewAllClicked = new EventEmitter<void>();
  @Output() removeClicked = new EventEmitter<string>();
  @Output() clearAllClicked = new EventEmitter<void>();

  private readonly maxVisibleNotifications = 6;

  public get visibleNotifications(): ReadonlyArray<NotificationEvent> {
    return this.notifications.slice(0, this.maxVisibleNotifications);
  }

  public onRemove(notificationId: string): void {
    this.removeClicked.emit(notificationId);
  }

  public onClearAll(): void {
    this.clearAllClicked.emit();
  }
}
