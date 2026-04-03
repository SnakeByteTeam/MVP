import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationEvent } from '../../../features/notification/models/notification-event.model';
import { API_BASE_URL } from '../../tokens/api-base-url.token';

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl: string = inject(API_BASE_URL);

    public getNotificationsHistory(): Observable<NotificationEvent[]> {
        return this.http.get<NotificationEvent[]>(`${this.baseUrl}/api/notifications`);
    }
}
