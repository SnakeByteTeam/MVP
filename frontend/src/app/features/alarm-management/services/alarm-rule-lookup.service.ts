import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, shareReplay } from 'rxjs';
import { AlarmRule } from '../../../core/alarm/models/alarm-rule.model';
import { AlarmApiService } from '../../../core/alarm/services/alarm-api.service';

@Injectable({ providedIn: 'root' })
export class AlarmRuleLookupService {
    private readonly alarmApiService = inject(AlarmApiService);
    private readonly cache = new Map<string, Observable<AlarmRule | null>>();

    public getAlarmRuleById(alarmRuleId: string): Observable<AlarmRule | null> {
        const normalizedId = alarmRuleId.trim();
        if (!normalizedId) {
            return of(null);
        }

        const cached = this.cache.get(normalizedId);
        if (cached) {
            return cached;
        }

        const request$ = this.alarmApiService.getAlarmRule(normalizedId).pipe(
            catchError(() => of<AlarmRule | null>(null)),
            shareReplay({ bufferSize: 1, refCount: false })
        );

        this.cache.set(normalizedId, request$);
        return request$;
    }

    public clearCache(): void {
        this.cache.clear();
    }
}
