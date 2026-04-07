import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-notification-badge-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './notification-badge-component.html',
  styleUrl: './notification-badge-component.css',
})
export class NotificationBadgeComponent {
  public readonly count = input(0);
  private readonly unreadCount = computed(() => Math.max(0, this.count()));

  public readonly isVisible = computed(() => this.unreadCount() > 0);
  public readonly displayCount = computed(() =>
    this.unreadCount() > 99 ? '99+' : `${this.unreadCount()}`
  );
  public readonly ariaLabel = computed(() => `${this.unreadCount()} notifiche non lette`);
}