import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
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
        loadAlarms: vi.fn(),
        toggleEnabled: vi.fn(() => of({} as AlarmRule)),
        deleteAlarm: vi.fn(() => of(void 0)),
    };

    const routerStub = {
        navigate: vi.fn().mockResolvedValue(true),
    };

    const routeStub = {
        snapshot: {
            paramMap: convertToParamMap({}),
        },
    };

    const alarmRule: AlarmRule = {
        id: 'alarm-1',
        name: 'Temperatura alta',
        apartmentId: 'apt-1',
        deviceId: 'dev-1',
        priority: AlarmPriority.RED,
        thresholdOperator: ThresholdOperator.GREATER_THAN,
        threshold: 30,
        activationTime: '08:00',
        deactivationTime: '20:00',
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
                { provide: Router, useValue: routerStub },
                { provide: ActivatedRoute, useValue: routeStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AlarmConfigPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('crea il componente', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit assegna stream e carica gli allarmi', () => {
        expect(stateServiceStub.loadAlarms).toHaveBeenCalledTimes(1);

        let latestAlarms: AlarmRule[] = [];
        let latestError: string | null = null;

        component.alarms$.subscribe((alarms) => {
            latestAlarms = alarms;
        });
        component.error$.subscribe((error) => {
            latestError = error;
        });

        alarmsSubject.next([alarmRule]);
        errorSubject.next('Errore test');

        expect(latestAlarms).toEqual([alarmRule]);
        expect(latestError).toBe('Errore test');
    });

    it('onCreateNew naviga verso ./new', () => {
        component.onCreateNew();

        expect(routerStub.navigate).toHaveBeenCalledWith(['./new'], { relativeTo: routeStub });
    });

    it('onEdit naviga verso ./:id/edit', () => {
        component.onEdit(alarmRule);

        expect(routerStub.navigate).toHaveBeenCalledWith(['./', 'alarm-1', 'edit'], { relativeTo: routeStub });
    });

    it('onToggleEnabled invoca toggleEnabled invertendo enabled', () => {
        component.onToggleEnabled(alarmRule);

        expect(stateServiceStub.toggleEnabled).toHaveBeenCalledWith('alarm-1', false);
    });

    it('onDelete invoca deleteAlarm con id', () => {
        component.onDelete('alarm-1');

        expect(stateServiceStub.deleteAlarm).toHaveBeenCalledWith('alarm-1');
    });

    it('renderizza la lista e il label corretto del pulsante toggle', () => {
        alarmsSubject.next([alarmRule]);
        fixture.detectChanges();

        const content = fixture.nativeElement.textContent as string;
        expect(content).toContain('Temperatura alta');
        expect(content).toContain('Disabilita');
    });

    it('renderizza messaggio vuoto quando non ci sono regole', () => {
        alarmsSubject.next([]);
        fixture.detectChanges();

        const content = fixture.nativeElement.textContent as string;
        expect(content).toContain('Nessuna regola configurata.');
    });
});
