import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlarmRule } from '../models/alarm-rule.model';
import { CreateAlarmRequestDto } from '../models/dto/create-alarm-request.model.dto';
import { UpdateAlarmRequestDto } from '../models/dto/update-alarm-request.model.dto';
import { ActiveAlarm } from '../models/active-alarm.model';

@Injectable({ providedIn: 'root' })
export class AlarmApiService {
    private readonly http = inject(HttpClient);
    private readonly alarmsBaseUrl = '/alarm-rules';
    private readonly activeAlarmsBaseUrl = '/active-alarms';

    public getAlarmRules(): Observable<AlarmRule[]> {
        return this.http.get<AlarmRule[]>(this.alarmsBaseUrl);
    }

    public getAlarmRule(id: string): Observable<AlarmRule> {
        return this.http.get<AlarmRule>(`${this.alarmsBaseUrl}/${encodeURIComponent(id)}`);
    }

    public createAlarmRule(payload: CreateAlarmRequestDto): Observable<AlarmRule> {
        return this.http.post<AlarmRule>(this.alarmsBaseUrl, payload);
    }

    public updateAlarmRule(id: string, payload: UpdateAlarmRequestDto): Observable<AlarmRule> {
        return this.http.patch<AlarmRule>(`${this.alarmsBaseUrl}/${encodeURIComponent(id)}`, payload);
    }

    public deleteAlarmRule(id: string): Observable<void> {
        return this.http.delete<void>(`${this.alarmsBaseUrl}/${encodeURIComponent(id)}`);
    }

    public getActiveAlarms(): Observable<ActiveAlarm[]> {
        return this.http.get<ActiveAlarm[]>(this.activeAlarmsBaseUrl);
    }

    public getActiveAlarmOfOperator(operatorId: string): Observable<ActiveAlarm[]> {
        return this.http.get<ActiveAlarm[]>(`${this.activeAlarmsBaseUrl}/operator/${encodeURIComponent(operatorId)}`);
    }

    public resolveAlarm(activeAlarmId: string): Observable<void> {
        return this.http.patch<void>(`${this.activeAlarmsBaseUrl}/${encodeURIComponent(activeAlarmId)}/resolve`, {});
    }
}
