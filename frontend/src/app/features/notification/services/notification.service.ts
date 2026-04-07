import { Injectable, inject } from '@angular/core';
import { combineLatest, catchError, map, Observable, of, shareReplay } from 'rxjs';
import { AlarmStateService } from '../../../core/alarm/services/alarm-state.service';
import { NotificationApiService } from '../../../core/notification/services/notification-api.service';
import { NotificationEvent } from '../models/notification-event.model';
import { NotificationListVm } from '../models/notification-list-vm.model';

// Nasconde la complessità della composizione tra le sorgenti di dati dietro
// un'interfaccia minimale: un unico campo pubblico `vm$`. Il componente smart
// non conosce né la provenienza dei dati né la logica di fusione.

// **Perché è component-scoped:** `NotificationService` mantiene sottoscrizioni
// attive verso `AlarmStateService` tramite `combineLatest`. Legarne il ciclo
// di vita al componente garantisce che queste sottoscrizioni vengano terminate
// automaticamente quando `NotificationPageComponent` viene distrutto (navigazione
// verso un'altra route), senza necessità di `ngOnDestroy` né di
// `takeUntilDestroyed`. Angular gestisce tutto tramite il suo injector locale.


@Injectable()
export class NotificationService {
    private readonly alarmStateService = inject(AlarmStateService);
    private readonly notificationApiService = inject(NotificationApiService);

    public readonly vm$: Observable<NotificationListVm> = combineLatest([
        this.notificationApiService
            .getNotificationsHistory()
            .pipe(catchError(() => of<NotificationEvent[]>([]))),
        this.alarmStateService.getNotifications$(),
        this.alarmStateService.getUnreadNotificationsCount$(),
    ]).pipe(
        map(([historic, inSession, unreadCount]): NotificationListVm => {
            const merged = [...historic, ...inSession];
            const deduped = Array.from(
                new Map(merged.map((notification) => [notification.notificationId, notification])).values()
            );

            deduped.sort(
                (left, right) =>
                    this.toUnixTimestamp(right.sentAt) - this.toUnixTimestamp(left.sentAt)
            );

            return {
                notifications: deduped,
                unreadCount,
            };
        }),


        shareReplay({ bufferSize: 1, refCount: false })
    );

    private toUnixTimestamp(dateValue: string): number {
        const timestamp = Date.parse(dateValue);
        return Number.isNaN(timestamp) ? 0 : timestamp;
    }
}