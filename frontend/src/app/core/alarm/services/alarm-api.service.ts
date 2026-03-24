import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlarmRule } from '../models/alarm-rule.model';
import { CreateAlarmRequestDto } from '../models/dto/create-alarm-request.model.dto';
import { UpdateAlarmRequestDto } from '../models/dto/update-alarm-request.model.dto';

@Injectable({ providedIn: 'root' })
export class AlarmApiService {
    private readonly http = inject(HttpClient);
    private readonly alarmsBaseUrl = '/api/alarms';
    private readonly activeAlarmsBaseUrl = '/api/active-alarms';

    public getAlarms(): Observable<AlarmRule[]> {
        return this.http.get<AlarmRule[]>(this.alarmsBaseUrl);
    }

    public getAlarm(id: string): Observable<AlarmRule> {
        return this.http.get<AlarmRule>(`${this.alarmsBaseUrl}/${encodeURIComponent(id)}`);
    }

    public createAlarm(payload: CreateAlarmRequestDto): Observable<AlarmRule> {
        return this.http.post<AlarmRule>(this.alarmsBaseUrl, payload);
    }

    public updateAlarm(id: string, payload: UpdateAlarmRequestDto): Observable<AlarmRule> {
        return this.http.patch<AlarmRule>(`${this.alarmsBaseUrl}/${encodeURIComponent(id)}`, payload);
    }

    public deleteAlarm(id: string): Observable<void> {
        return this.http.delete<void>(`${this.alarmsBaseUrl}/${encodeURIComponent(id)}`);
    }

    public resolveAlarm(activeAlarmId: string): Observable<void> {
        return this.http.patch<void>(`${this.activeAlarmsBaseUrl}/${encodeURIComponent(activeAlarmId)}/resolve`, {});
    }
}
