import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AlarmRule } from '../../../core/alarm/models/alarm-rule.model';
import { CreateAlarmRuleRequestDto } from '../../../core/alarm/models/dto/create-alarm-rule-request.model.dto';
import { UpdateAlarmRuleRequestDto } from '../../../core/alarm/models/dto/update-alarm-rule-request.model.dto';
import { AlarmApiService } from '../../../core/alarm/services/alarm-api.service';
import { ApiErrorDisplayService } from '../../../core/services/api-error-display.service';
import { AlarmRuleRequestMapper } from '../mappers/alarm-rule-request.mapper';
import { AlarmConfigFormValue } from '../models/alarm-config-form-value.model';

@Injectable()
export class AlarmConfigStateService {
    private readonly api = inject(AlarmApiService);
    private readonly apiErrorDisplayService = inject(ApiErrorDisplayService);
    private readonly requestMapper = inject(AlarmRuleRequestMapper);

    private readonly alarmsSubject = new BehaviorSubject<AlarmRule[]>([]);
    private readonly errorSubject = new BehaviorSubject<string | null>(null);

    public readonly alarms$ = this.alarmsSubject.asObservable();
    public readonly error$ = this.errorSubject.asObservable();


    private replaceAlarmInState(updatedAlarm: AlarmRule): void {
        const currentAlarms = this.alarmsSubject.getValue();
        this.alarmsSubject.next(currentAlarms.map((alarm) => (alarm.id === updatedAlarm.id ? updatedAlarm : alarm)));
    }

    private clearError(): void {
        if (this.errorSubject.getValue() !== null) {
            this.errorSubject.next(null);
        }
    }

    private handleError<T>(message: string): Observable<T> {
        this.errorSubject.next(message);
        return EMPTY;
    }


    //carica soglie di allarme
    public loadAlarmRules(): void {
        this.clearError();
        this.api
            .getAlarmRules()
            .pipe(
                tap((alarms) => this.alarmsSubject.next(alarms)),
                catchError((error: unknown) =>
                    this.handleError<AlarmRule[]>(
                        this.apiErrorDisplayService.toMessage(error, {
                            fallbackMessage: 'Errore durante il caricamento degli allarmi.',
                            nonHttpStrategy: 'fallback',
                        }),
                    ),
                )
            )
            .subscribe();
    }

    public getAlarmRuleById(id: string): Observable<AlarmRule> {
        this.clearError();
        return this.api.getAlarmRule(id).pipe(
            catchError((error: unknown) =>
                this.handleError<AlarmRule>(
                    this.apiErrorDisplayService.toMessage(error, {
                        fallbackMessage: 'Errore durante il recupero dell\'allarme.',
                        nonHttpStrategy: 'fallback',
                    }),
                ),
            ),
        );
    }

    //a partire dal form -> mapping a DTO -> service API -> aggiornamento stato locale
    public createAlarmRule(formValue: AlarmConfigFormValue): Observable<AlarmRule> {
        this.clearError();
        let payload: CreateAlarmRuleRequestDto;
        try {
            payload = this.requestMapper.toCreateRequest(formValue);
        } catch {
            return this.handleError<AlarmRule>('Dati del form non validi per la creazione dell\'allarme.');
        }

        return this.api.createAlarmRule(payload).pipe(
            tap((createdAlarm) => {
                const currentAlarms = this.alarmsSubject.getValue();
                this.alarmsSubject.next([...currentAlarms, createdAlarm]);
            }),
            catchError((error: unknown) =>
                this.handleError<AlarmRule>(
                    this.apiErrorDisplayService.toMessage(error, {
                        fallbackMessage: 'Errore durante la creazione dell\'allarme.',
                        nonHttpStrategy: 'fallback',
                    }),
                ),
            )
        );
    }

    public updateAlarmRule(alarmId: string, formValue: AlarmConfigFormValue): Observable<AlarmRule> {
        this.clearError();
        let payload: UpdateAlarmRuleRequestDto;
        const currentAlarm = this.alarmsSubject.getValue().find((alarm) => alarm.id === alarmId);
        const normalizedFormValue = currentAlarm
            ? { ...formValue, name: currentAlarm.name }
            : formValue;

        try {
            payload = this.requestMapper.toUpdateRequest(normalizedFormValue);
        } catch {
            return this.handleError<AlarmRule>('Dati del form non validi per l\'aggiornamento dell\'allarme.');
        }

        return this.api.updateAlarmRule(alarmId, payload).pipe(
            tap((updatedAlarm) => this.replaceAlarmInState(updatedAlarm)),
            catchError((error: unknown) =>
                this.handleError<AlarmRule>(
                    this.apiErrorDisplayService.toMessage(error, {
                        fallbackMessage: 'Errore durante l\'aggiornamento dell\'allarme.',
                        nonHttpStrategy: 'fallback',
                    }),
                ),
            )
        );
    }

    public toggleEnabled(alarmId: string, enabled: boolean): Observable<AlarmRule> {
        this.clearError();
        const currentAlarm = this.alarmsSubject.getValue().find((alarm) => alarm.id === alarmId);
        if (!currentAlarm) {
            return this.handleError<AlarmRule>('Allarme non trovato nello stato locale.');
        }

        const payload = this.requestMapper.toToggleRequest(currentAlarm, enabled);

        return this.api.updateAlarmRule(alarmId, payload).pipe(
            tap((updatedAlarm) => this.replaceAlarmInState(updatedAlarm)),
            catchError((error: unknown) =>
                this.handleError<AlarmRule>(
                    this.apiErrorDisplayService.toMessage(error, {
                        fallbackMessage: 'Errore durante la modifica dello stato dell\'allarme.',
                        nonHttpStrategy: 'fallback',
                    }),
                ),
            )
        );
    }

    public deleteAlarmRule(alarmId: string): Observable<void> {
        this.clearError();

        return this.api.deleteAlarmRule(alarmId).pipe(
            tap(() => {
                const currentAlarms = this.alarmsSubject.getValue();
                this.alarmsSubject.next(currentAlarms.filter((alarm) => alarm.id !== alarmId));
            }),
            catchError((error: unknown) =>
                this.handleError<void>(
                    this.apiErrorDisplayService.toMessage(error, {
                        fallbackMessage: 'Errore durante l\'eliminazione dell\'allarme.',
                        nonHttpStrategy: 'fallback',
                    }),
                ),
            )
        );
    }

}
