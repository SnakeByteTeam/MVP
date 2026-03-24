import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AlarmStateService } from '../../core/alarm/services/alarm-state.service';
import { NotificationBadgeComponent } from '../notification/components/notification-badge-component/notification-badge-component';

@Component({
    selector: 'app-main-layout',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AsyncPipe, NotificationBadgeComponent],
    template: `
		<app-notification-badge-component [count]="(unreadNotificationsCount$ | async) ?? 0"></app-notification-badge-component>
	`,
})
export class MainLayoutComponent {
    private readonly alarmStateService = inject(AlarmStateService);

    public readonly unreadNotificationsCount$ = this.alarmStateService.getUnreadNotificationsCount$();
}
