import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, EMPTY, Subject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import { ThresholdOperator } from '../../../../core/alarm/models/threshold-operator.enum';
import { ApartmentApiService } from '../../../apartment-monitor/services/apartment-api.service';
import { WardApiService } from '../../../ward-management/services/ward-api.service';
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

    const wardApiStub = {
        getAvailablePlants: vi.fn(() => of([])),
        getWards: vi.fn(() => of([])),
        getPlantsByWardId: vi.fn(() => of([])),
    };

    const apartmentApiStub = {
        getApartmentByPlantId: vi.fn(() => of({ id: 'plant-1', name: 'Plant', isEnabled: true, rooms: [] })),
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
        position: 'Appartamento 1 - Soggiorno - Sensore porta',
    };

    const formValue = {
        name: 'Nuova regola',
        plantId: 'plant-1',
        deviceId: 'sensor-1',
        priority: AlarmPriority.GREEN,
        thresholdOperator: ThresholdOperator.GREATER_THAN,
        thresholdValue: '12',
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
                { provide: WardApiService, useValue: wardApiStub },
                { provide: ApartmentApiService, useValue: apartmentApiStub },
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
        expect(component.modalTitle()).toBe('Creazione allarme');
    });

    it('onEdit apre la modale in edit mode con regola selezionata', () => {
        alarmsSubject.next([alarmRule]);
        fixture.detectChanges();

        component.onEdit('alarm-1');

        expect(component.isModalOpen()).toBe(true);
        expect(component.editingRule()?.id).toBe('alarm-1');
        expect(component.modalTitle()).toBe('Modifica allarme');
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

    it('onFormSubmitted in create mode mantiene aperta la modale se non arriva alcun esito', () => {
        stateServiceStub.createAlarmRule.mockReturnValueOnce(EMPTY);
        component.onCreateNew();

        component.onFormSubmitted(formValue);

        expect(stateServiceStub.createAlarmRule).toHaveBeenCalledWith(formValue);
        expect(component.isModalOpen()).toBe(true);
        expect(component.editingRule()).toBeNull();
    });

    it('onFormSubmitted in edit mode invoca update e chiude modale', () => {
        alarmsSubject.next([alarmRule]);
        fixture.detectChanges();
        component.onEdit('alarm-1');

        component.onFormSubmitted(formValue);

        expect(stateServiceStub.updateAlarmRule).toHaveBeenCalledWith('alarm-1', formValue);
        expect(component.isModalOpen()).toBe(false);
    });

    it('onFormSubmitted in edit mode mantiene aperta la modale se non arriva alcun esito', () => {
        alarmsSubject.next([alarmRule]);
        fixture.detectChanges();
        component.onEdit('alarm-1');
        stateServiceStub.updateAlarmRule.mockReturnValueOnce(EMPTY);

        component.onFormSubmitted(formValue);

        expect(component.isModalOpen()).toBe(true);
        expect(component.editingRule()?.id).toBe('alarm-1');
    });

    it('onToggleEnabled invoca toggleEnabled con lo stato richiesto', () => {
        component.onToggleEnabled('alarm-1', false);

        expect(stateServiceStub.toggleEnabled).toHaveBeenCalledWith('alarm-1', false);
    });

    it('onToggleEnabled blocca i click ripetuti finché la richiesta è in corso', () => {
        const toggleSubject = new Subject<AlarmRule>();
        stateServiceStub.toggleEnabled.mockReturnValueOnce(toggleSubject.asObservable());

        component.onToggleEnabled('alarm-1', false);
        component.onToggleEnabled('alarm-1', true);

        expect(component.pendingToggleRuleId()).toBe('alarm-1');
        expect(stateServiceStub.toggleEnabled).toHaveBeenCalledTimes(1);

        toggleSubject.next(alarmRule);
        toggleSubject.complete();

        expect(component.pendingToggleRuleId()).toBeNull();

        component.onToggleEnabled('alarm-1', true);

        expect(stateServiceStub.toggleEnabled).toHaveBeenCalledTimes(2);
    });

    it('onDelete apre la modale di conferma senza chiamare subito la delete', () => {
        component.onDelete('alarm-1', 'Temperatura alta');

        expect(component.pendingDelete()).toEqual({ id: 'alarm-1', name: 'Temperatura alta' });
        expect(stateServiceStub.deleteAlarmRule).not.toHaveBeenCalled();
    });

    it('onDeleteConfirmed invoca deleteAlarmRule con id e chiude la modale di conferma', () => {
        component.onDelete('alarm-1', 'Temperatura alta');

        component.onDeleteConfirmed();

        expect(stateServiceStub.deleteAlarmRule).toHaveBeenCalledWith('alarm-1');
        expect(component.pendingDelete()).toBeNull();
    });

    it('onDeleteCancelled chiude la modale di conferma senza eliminare', () => {
        component.onDelete('alarm-1', 'Temperatura alta');

        component.onDeleteCancelled();

        expect(component.pendingDelete()).toBeNull();
        expect(stateServiceStub.deleteAlarmRule).not.toHaveBeenCalled();
    });

    it('renderizza la modale di conferma cancellazione quando richiesta', () => {
        alarmsSubject.next([alarmRule]);
        fixture.detectChanges();

        component.onDelete('alarm-1', 'Temperatura alta');
        fixture.detectChanges();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const confirmDialog = nativeElement.querySelector('app-confirm-dialog');
        const content = nativeElement.textContent ?? '';

        expect(confirmDialog).not.toBeNull();
        expect(content).toContain('Confermi l\'eliminazione della soglia "Temperatura alta"?');
    });

    it('onModalClosed chiude modale e resetta editingRule', () => {
        alarmsSubject.next([alarmRule]);
        fixture.detectChanges();
        component.onEdit('alarm-1');

        component.onModalClosed();

        expect(component.isModalOpen()).toBe(false);
        expect(component.editingRule()).toBeNull();
    });

    it('onCreateNew resetta l eventuale regola in edit e apre la modale in create', () => {
        alarmsSubject.next([alarmRule]);
        fixture.detectChanges();
        component.onEdit('alarm-1');

        component.onCreateNew();

        expect(component.isModalOpen()).toBe(true);
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
        expect(content).toContain('Posizione');
        expect(content).toContain('Appartamento 1 - Soggiorno - Sensore porta');
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
