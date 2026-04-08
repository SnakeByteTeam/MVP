import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificationEvent } from '../../models/notification-event.model';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import {
  extractPriorityFromNotificationTitle,
  stripPriorityFromNotificationTitle,
} from '../../../../core/notification/utils/notification-priority-display.util';

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

  public getPriority(notification: NotificationEvent): AlarmPriority | null {
    return extractPriorityFromNotificationTitle(notification.title);
  }

  public getDisplayTitle(notification: NotificationEvent): string {
    return stripPriorityFromNotificationTitle(notification.title) || notification.title;
  }

  public getPrioritySymbol(priority: AlarmPriority): string {
    switch (priority) {
      case AlarmPriority.WHITE:
        return 'i';
      case AlarmPriority.GREEN:
        return '\u2022';
      case AlarmPriority.ORANGE:
        return '!';
      case AlarmPriority.RED:
        return '\u25b2';
      default:
        return '';
    }
  }

  public getPriorityBubbleClass(priority: AlarmPriority): string {
    switch (priority) {
      case AlarmPriority.WHITE:
        return 'border-slate-400 text-slate-700';
      case AlarmPriority.GREEN:
        return 'border-emerald-500 text-emerald-700';
      case AlarmPriority.ORANGE:
        return 'border-amber-500 text-amber-700';
      case AlarmPriority.RED:
        return 'border-rose-500 text-rose-700';
      default:
        return 'border-slate-400 text-slate-700';
    }
  }

  public getPrioritySymbolClass(priority: AlarmPriority): string {
    switch (priority) {
      case AlarmPriority.WHITE:
        return 'text-slate-600';
      case AlarmPriority.GREEN:
        return 'text-emerald-600';
      case AlarmPriority.ORANGE:
        return 'text-amber-600';
      case AlarmPriority.RED:
        return 'text-rose-600';
      default:
        return 'text-slate-600';
    }
  }
}
