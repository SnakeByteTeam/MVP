import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlarmRule } from '../models/alarm-rule.model';
import { CreateAlarmRuleRequestDto } from '../models/dto/create-alarm-rule-request.model.dto';
import { UpdateAlarmRuleRequestDto } from '../models/dto/update-alarm-rule-request.model.dto';
import { ActiveAlarm } from '../models/active-alarm.model';
import { API_BASE_URL } from '../../tokens/api-base-url.token';

@Injectable({ providedIn: 'root' })
export class AlarmApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(API_BASE_URL);
    private readonly alarmsBaseUrl = `${this.baseUrl}/alarm-rules`;
    private readonly alarmEventsBaseUrl = `${this.baseUrl}/alarm-events`;

    public getAlarmRules(): Observable<AlarmRule[]> {
        return this.http.get<AlarmRule[]>(this.alarmsBaseUrl);
    }

    public getAlarmRule(id: string): Observable<AlarmRule> {
        return this.http.get<AlarmRule>(`${this.alarmsBaseUrl}/${encodeURIComponent(id)}`);
    }

    public createAlarmRule(payload: CreateAlarmRuleRequestDto): Observable<AlarmRule> {
        return this.http.post<AlarmRule>(this.alarmsBaseUrl, payload);
    }

    public updateAlarmRule(id: string, payload: UpdateAlarmRuleRequestDto): Observable<AlarmRule> {
        return this.http.put<AlarmRule>(`${this.alarmsBaseUrl}/${encodeURIComponent(id)}`, payload);
    }

    public deleteAlarmRule(id: string): Observable<void> {
        return this.http.delete<void>(`${this.alarmsBaseUrl}/${encodeURIComponent(id)}`);
    }

    public getActiveAlarms(): Observable<ActiveAlarm[]> {
        return this.http.get<ActiveAlarm[]>(this.alarmEventsBaseUrl + '/10/0');
    }

    public getActiveAlarmsOfOperator(operatorId: string): Observable<ActiveAlarm[]> {
        return this.http.get<ActiveAlarm[]>(`${this.alarmEventsBaseUrl}/${encodeURIComponent(operatorId)}`);
    }

    public resolveAlarm(alarmId: string, userId: number): Observable<void> {
        return this.http.post<void>(`${this.alarmEventsBaseUrl}/resolve`, { alarmId, userId });
    }
}
