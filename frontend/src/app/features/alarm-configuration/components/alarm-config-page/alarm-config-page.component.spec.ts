import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import { ThresholdOperator } from '../../../../core/alarm/models/threshold-operator.enum';
import type { AlarmRule } from '../../../../core/alarm/models/alarm-rule.model';
import { AlarmConfigStateService } from '../../services/alarm-config-state.service';
import { AlarmConfigPageComponent } from './alarm-config-page.component';

describe('AlarmConfigPageComponent', () => {
    let component: AlarmConfigPageComponent;
    let fixture: ComponentFixture<AlarmConfigPageComponent>;

    const alarmsSubject = new BehaviorSubject<AlarmRule[]>([]);
    const errorSubject = new BehaviorSubject<string | null>(null);

    const stateServiceStub = {
        alarms$: alarmsSubject.asObservable(),
        error$: errorSubject.asObservable(),
        loadAlarmRules: vi.fn(),
        createAlarmRule: vi.fn(() => of({} as AlarmRule)),
        updateAlarmRule: vi.fn(() => of({} as AlarmRule)),
        toggleEnabled: vi.fn(() => of({} as AlarmRule)),
        deleteAlarmRule: vi.fn(() => of(void 0)),
    };

    const alarmRule: AlarmRule = {
        id: 'alarm-1',
        name: 'Temperatura alta',
        thresholdOperator: '>',
        thresholdValue: '30',
        priority: AlarmPriority.RED,
        armingTime: '08:00:00',
        dearmingTime: '20:00:00',
        isArmed: true,
        deviceId: 'dev-1',
    };

    const formValue = {
        name: 'Nuova regola',
        sensorId: 'sensor-1',
        priority: AlarmPriority.GREEN,
        thresholdOperator: ThresholdOperator.GREATER_THAN,
        threshold: 12,
        armingTime: '08:00',
        dearmingTime: '18:00',
        enabled: true,
    };

    beforeEach(async () => {
        vi.clearAllMocks();
        alarmsSubject.next([]);
        errorSubject.next(null);

        await TestBed.configureTestingModule({
            imports: [AlarmConfigPageComponent],
            providers: [
                { provide: AlarmConfigStateService, useValue: stateServiceStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AlarmConfigPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('crea il componente', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit carica gli allarmi e aggiorna le righe tabellari', () => {
        expect(stateServiceStub.loadAlarmRules).toHaveBeenCalledTimes(1);

        alarmsSubject.next([alarmRule]);
        errorSubject.next('Errore test');
        fixture.detectChanges();

        expect(component.rows().length).toBe(1);
        expect(component.error()).toBe('Errore test');
    });

    it('onCreateNew apre la modale in create mode', () => {
        component.onCreateNew();

        expect(component.isModalOpen()).toBe(true);
        expect(component.editingRule()).toBeNull();
    });

    it('onEdit apre la modale in edit mode con regola selezionata', () => {
        alarmsSubject.next([alarmRule]);
        fixture.detectChanges();

        component.onEdit('alarm-1');

        expect(component.isModalOpen()).toBe(true);
        expect(component.editingRule()?.id).toBe('alarm-1');
    });

    it('onEdit ignora id non trovato', () => {
        alarmsSubject.next([alarmRule]);
        fixture.detectChanges();

        component.onEdit('unknown-id');

        expect(component.isModalOpen()).toBe(false);
        expect(component.editingRule()).toBeNull();
    });

    it('onFormSubmitted in create mode invoca create e chiude modale', () => {
        component.onCreateNew();

        component.onFormSubmitted(formValue);

        expect(stateServiceStub.createAlarmRule).toHaveBeenCalledWith(formValue);
        expect(component.isModalOpen()).toBe(false);
    });

    it('onFormSubmitted in edit mode invoca update e chiude modale', () => {
        alarmsSubject.next([alarmRule]);
        fixture.detectChanges();
        component.onEdit('alarm-1');

        component.onFormSubmitted(formValue);

        expect(stateServiceStub.updateAlarmRule).toHaveBeenCalledWith('alarm-1', formValue);
        expect(component.isModalOpen()).toBe(false);
    });

    it('onToggleEnabled invoca toggleEnabled con lo stato richiesto', () => {
        component.onToggleEnabled('alarm-1', false);

        expect(stateServiceStub.toggleEnabled).toHaveBeenCalledWith('alarm-1', false);
    });

    it('onDelete invoca deleteAlarmRule con id', () => {
        component.onDelete('alarm-1');

        expect(stateServiceStub.deleteAlarmRule).toHaveBeenCalledWith('alarm-1');
    });

    it('onModalClosed chiude modale e resetta editingRule', () => {
        alarmsSubject.next([alarmRule]);
        fixture.detectChanges();
        component.onEdit('alarm-1');

        component.onModalClosed();

        expect(component.isModalOpen()).toBe(false);
        expect(component.editingRule()).toBeNull();
    });

    it('renderizza la tabella con le righe e i pulsanti azione', () => {
        alarmsSubject.next([alarmRule]);
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const content = nativeElement.textContent ?? '';
        const tableRows = nativeElement.querySelectorAll('tbody tr');

        expect(tableRows.length).toBe(1);
        expect(content).toContain('Temperatura alta');
        expect(content).toContain('Appartamento');
        expect(content).toContain('MODIFICA');
        expect(content).toContain('ELIMINA');
    });

    it('renderizza messaggio vuoto quando non ci sono regole', () => {
        alarmsSubject.next([]);
        fixture.detectChanges();

        const content = fixture.nativeElement.textContent as string;
        expect(content).toContain('Nessuna regola configurata.');
    });

    it('renderizza il form in modale quando la modale e aperta', () => {
        component.onCreateNew();
        fixture.detectChanges();

        const modalForm = fixture.nativeElement.querySelector('app-alarm-config-form');
        expect(modalForm).not.toBeNull();
    });
});
