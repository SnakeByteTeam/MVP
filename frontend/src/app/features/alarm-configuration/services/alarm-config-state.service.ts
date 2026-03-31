import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AlarmRule } from '../../../core/alarm/models/alarm-rule.model';
import { CreateAlarmRequestDto } from '../../../core/alarm/models/dto/create-alarm-request.model.dto';
import { UpdateAlarmRequestDto } from '../../../core/alarm/models/dto/update-alarm-request.model.dto';
import { AlarmPriority } from '../../../core/alarm/models/alarm-priority.enum';
import { ThresholdOperator } from '../../../core/alarm/models/threshold-operator.enum';
import { AlarmApiService } from '../../../core/alarm/services/alarm-api.service';
import { AlarmConfigFormValue } from '../models/alarm-config-form-value.model';

@Injectable()
export class AlarmConfigStateService {
    private readonly api = inject(AlarmApiService);

    private readonly alarmsSubject = new BehaviorSubject<AlarmRule[]>([]);
    private readonly errorSubject = new BehaviorSubject<string | null>(null);

    public readonly alarms$ = this.alarmsSubject.asObservable();
    public readonly error$ = this.errorSubject.asObservable();


    private replaceAlarmInState(updatedAlarm: AlarmRule): void {
        const currentAlarms = this.alarmsSubject.getValue();
        this.alarmsSubject.next(currentAlarms.map((alarm) => (alarm.id === updatedAlarm.id ? updatedAlarm : alarm)));
    }

    private requireField<T>(value: T | null, fieldName: string): T {
        if (value === null) {
            throw new Error(`Campo obbligatorio mancante: ${fieldName}`);
        }

        return value;
    }

    //per convertire le enum
    private toPriorityNumber(priority: AlarmPriority | null): number {
        return this.requireField(priority, 'priority');
    }

    private toThresholdOperatorCode(operator: ThresholdOperator | null): string {
        return this.requireField(operator, 'thresholdOperator');
    }

    private requireNonEmptyString(value: string, fieldName: string): string {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            throw new Error(`Campo obbligatorio mancante: ${fieldName}`);
        }

        return trimmed;
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
                catchError(() => this.handleError<AlarmRule[]>('Errore durante il caricamento degli allarmi.'))
            )
            .subscribe();
    }

    public getAlarmRuleById(id: string): Observable<AlarmRule> {
        this.clearError();
        return this.api.getAlarmRule(id).pipe(catchError(() => this.handleError<AlarmRule>('Errore durante il recupero dell\'allarme.')));
    }

    public createAlarmRule(formValue: AlarmConfigFormValue): Observable<AlarmRule> {
        this.clearError();
        let payload: CreateAlarmRequestDto;
        try {
            payload = this.mapToCreateRequest(formValue);
        } catch {
            return this.handleError<AlarmRule>('Dati del form non validi per la creazione dell\'allarme.');
        }

        return this.api.createAlarmRule(payload).pipe(
            tap((createdAlarm) => {
                const currentAlarms = this.alarmsSubject.getValue();
                this.alarmsSubject.next([...currentAlarms, createdAlarm]);
            }),
            catchError(() => this.handleError<AlarmRule>('Errore durante la creazione dell\'allarme.'))
        );
    }

    public updateAlarmRule(alarmId: string, formValue: AlarmConfigFormValue): Observable<AlarmRule> {
        this.clearError();
        let payload: UpdateAlarmRequestDto;
        try {
            payload = this.mapToUpdateRequest(formValue);
        } catch {
            return this.handleError<AlarmRule>('Dati del form non validi per l\'aggiornamento dell\'allarme.');
        }

        return this.api.updateAlarmRule(alarmId, payload).pipe(
            tap((updatedAlarm) => this.replaceAlarmInState(updatedAlarm)),
            catchError(() => this.handleError<AlarmRule>('Errore durante l\'aggiornamento dell\'allarme.'))
        );
    }

    public toggleEnabled(alarmId: string, enabled: boolean): Observable<AlarmRule> {
        this.clearError();
        const currentAlarm = this.alarmsSubject.getValue().find((alarm) => alarm.id === alarmId);
        if (!currentAlarm) {
            return this.handleError<AlarmRule>('Allarme non trovato nello stato locale.');
        }

        const payload: UpdateAlarmRequestDto = {
            name: currentAlarm.name,
            priority: currentAlarm.priority,
            thresholdOperator: currentAlarm.thresholdOperator,
            threshold: String(currentAlarm.threshold),
            activationTime: currentAlarm.activationTime,
            deactivationTime: currentAlarm.deactivationTime,
            enabled,
        };

        return this.api.updateAlarmRule(alarmId, payload).pipe(
            tap((updatedAlarm) => this.replaceAlarmInState(updatedAlarm)),
            catchError(() => this.handleError<AlarmRule>('Errore durante la modifica dello stato dell\'allarme.'))
        );
    }

    public deleteAlarmRule(alarmId: string): Observable<void> {
        this.clearError();

        return this.api.deleteAlarmRule(alarmId).pipe(
            tap(() => {
                const currentAlarms = this.alarmsSubject.getValue();
                this.alarmsSubject.next(currentAlarms.filter((alarm) => alarm.id !== alarmId));
            }),
            catchError(() => this.handleError<void>('Errore durante l\'eliminazione dell\'allarme.'))
        );
    }

    //per convertire da FORM a richiesta DTO da inviare al backend
    private mapToCreateRequest(formValue: AlarmConfigFormValue): CreateAlarmRequestDto {
        return {
            name: this.requireNonEmptyString(formValue.name, 'name'),
            apartmentId: formValue.apartmentId,
            deviceId: this.requireNonEmptyString(formValue.sensorId, 'sensorId'),
            priority: this.toPriorityNumber(formValue.priority),
            thresholdOperator: this.toThresholdOperatorCode(formValue.thresholdOperator),
            threshold: String(this.requireField(formValue.threshold, 'threshold')),
            activationTime: formValue.activationTime,
            deactivationTime: formValue.deactivationTime,
        };
    }

    private mapToUpdateRequest(formValue: AlarmConfigFormValue): UpdateAlarmRequestDto {
        return {
            name: this.requireNonEmptyString(formValue.name, 'name'),
            priority: this.toPriorityNumber(formValue.priority),
            thresholdOperator: this.toThresholdOperatorCode(formValue.thresholdOperator),
            threshold: String(this.requireField(formValue.threshold, 'threshold')),
            activationTime: formValue.activationTime,
            deactivationTime: formValue.deactivationTime,
            enabled: formValue.enabled,
        };
    }
}
