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
}
