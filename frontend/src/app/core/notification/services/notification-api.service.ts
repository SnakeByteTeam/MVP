import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap, take } from 'rxjs';
import { InternalAuthService } from '../../services/internal-auth.service';
import { NotificationEvent } from '../../../features/notification/models/notification-event.model';
import { API_BASE_URL } from '../../tokens/api-base-url.token';

interface AlarmEventHistoryDto {
    id?: unknown;
    activationTime?: unknown;
    resolutionTime?: unknown;
}

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl: string = inject(API_BASE_URL);
    private readonly authService = inject(InternalAuthService);

    private static readonly HISTORY_LIMIT = 100;
    private static readonly HISTORY_OFFSET = 0;

    public getNotificationsHistory(): Observable<NotificationEvent[]> {
        return this.authService.getCurrentUser$().pipe(
            take(1),
            switchMap((session) => {
                if (!session) {
                    return of<NotificationEvent[]>([]);
                }

                const encodedUserId = encodeURIComponent(session.userId);

                return forkJoin([
                    this.fetchManagedAlarmEvents(encodedUserId),
                    this.fetchUnmanagedAlarmEvents(encodedUserId),
                ]).pipe(
                    map(([managedEvents, unmanagedEvents]) =>
                        this.mapAlarmEventsToNotifications([...managedEvents, ...unmanagedEvents])
                    )
                );
            })
        );
    }

    private fetchManagedAlarmEvents(encodedUserId: string): Observable<AlarmEventHistoryDto[]> {
        const endpoint = `${this.baseUrl}/alarm-events/managed/${encodedUserId}/${NotificationApiService.HISTORY_LIMIT}/${NotificationApiService.HISTORY_OFFSET}`;

        return this.http.get<AlarmEventHistoryDto[]>(endpoint).pipe(
            map((response) => (Array.isArray(response) ? response : [])),
            catchError(() => of<AlarmEventHistoryDto[]>([]))
        );
    }

    private fetchUnmanagedAlarmEvents(encodedUserId: string): Observable<AlarmEventHistoryDto[]> {
        const endpoint = `${this.baseUrl}/alarm-events/unmanaged/${encodedUserId}/${NotificationApiService.HISTORY_LIMIT}/${NotificationApiService.HISTORY_OFFSET}`;

        return this.http.get<AlarmEventHistoryDto[]>(endpoint).pipe(
            map((response) => (Array.isArray(response) ? response : [])),
            catchError(() => of<AlarmEventHistoryDto[]>([]))
        );
    }

    private mapAlarmEventsToNotifications(alarmEvents: ReadonlyArray<AlarmEventHistoryDto>): NotificationEvent[] {
        const notifications: NotificationEvent[] = [];

        for (const alarmEvent of alarmEvents) {
            const mappedNotification = this.mapAlarmEventToNotification(alarmEvent);
            if (mappedNotification) {
                notifications.push(mappedNotification);
            }
        }

        return notifications;
    }

    private mapAlarmEventToNotification(alarmEvent: AlarmEventHistoryDto): NotificationEvent | null {
        const alarmEventId = typeof alarmEvent.id === 'string' ? alarmEvent.id : null;
        if (!alarmEventId) {
            return null;
        }

        const activationTime = this.toIsoString(alarmEvent.activationTime);
        const resolutionTime = this.toIsoString(alarmEvent.resolutionTime);
        const isResolved = resolutionTime !== null;
        const sentAt = isResolved ? resolutionTime : activationTime;

        if (!sentAt) {
            return null;
        }

        return {
            notificationId: `alarm-${isResolved ? 'resolved' : 'triggered'}-${alarmEventId}`,
            title: isResolved ? 'Allarme risolto' : "C'e un allarme in corso",
            sentAt,
        };
    }

    private toIsoString(value: unknown): string | null {
        if (typeof value === 'string' && value.trim()) {
            return value;
        }

        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return value.toISOString();
        }

        return null;
    }
}
