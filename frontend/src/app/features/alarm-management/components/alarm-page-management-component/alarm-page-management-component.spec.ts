import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActiveAlarm } from '../../../../core/alarm/models/active-alarm.model';
import { AlarmPriority } from '../../../../core/alarm/models/alarm-priority.enum';
import { UserRole } from '../../../../core/models/user-role.enum';
import { InternalAuthService } from '../../../../core/services/internal-auth.service';
import type { UserSession } from '../../../user-auth/models/user-session.model';
import type { AlarmListVm } from '../../models/alarm-list-vm.model';
import { AlarmManagementService } from '../../services/alarm-management.service';
import { AlarmPageManagementComponent } from './alarm-page-management-component';

describe('AlarmPageManagementComponent', () => {
  let component: AlarmPageManagementComponent;
  let fixture: ComponentFixture<AlarmPageManagementComponent>;
  let vmSubject: BehaviorSubject<AlarmListVm>;
  let userSessionSubject: BehaviorSubject<UserSession | null>;

  const alarm1: ActiveAlarm = {
    id: 'active-1',
    alarmRuleId: 'rule-1',
    deviceId: 'device-1',
    alarmName: 'Antipanico',
    priority: AlarmPriority.RED,
    activationTime: '2026-03-24T10:00:00.000Z',
    resolutionTime: null,
    position: 'Camera 201',
    userId: 1,
    userUsername: 'oss_1',
  };

  const alarm2: ActiveAlarm = {
    id: 'active-2',
    alarmRuleId: 'rule-2',
    deviceId: 'device-2',
    alarmName: 'Porta aperta',
    priority: AlarmPriority.ORANGE,
    activationTime: '2026-03-24T10:01:00.000Z',
    resolutionTime: null,
    position: 'Corridoio Nord',
    userId: 2,
    userUsername: 'oss_2',
  };

  const managedAlarm: ActiveAlarm = {
    ...alarm1,
    resolutionTime: '2026-03-24T10:05:00.000Z',
    userId: 99,
  };

  const alarmManagementStub = {
    vm$: undefined as unknown,
    initialize: vi.fn(),
    resolveAlarm: vi.fn(),
    nextPage: vi.fn(),
    previousPage: vi.fn(),
  };

  const authServiceStub = {
    getCurrentUser$: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    vmSubject = new BehaviorSubject<AlarmListVm>({
      alarms: [],
      currentPage: 1,
      pageLimit: 6,
      pageOffset: 0,
      canGoPrevious: false,
      canGoNext: false,
      isResolving: false,
      resolvingId: null,
      resolveError: null,
    });

    alarmManagementStub.vm$ = vmSubject.asObservable();
    userSessionSubject = new BehaviorSubject<UserSession | null>({
      userId: '1',
      username: 'admin',
      role: UserRole.AMMINISTRATORE,
      accessToken: 'token',
      isFirstAccess: false,
    });
    authServiceStub.getCurrentUser$.mockReturnValue(userSessionSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [AlarmPageManagementComponent],
      providers: [
        { provide: AlarmManagementService, useValue: alarmManagementStub },
        { provide: InternalAuthService, useValue: authServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AlarmPageManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('ngOnInit inizializza la facade e mantiene il vm sincronizzato', () => {
    expect(component.vm()).toEqual({
      alarms: [],
      currentPage: 1,
      pageLimit: 6,
      pageOffset: 0,
      canGoPrevious: false,
      canGoNext: false,
      isResolving: false,
      resolvingId: null,
      resolveError: null,
    });

    component.ngOnInit();

    expect(alarmManagementStub.initialize).toHaveBeenCalledTimes(1);
    expect(component.vm()?.alarms).toEqual([]);
  });

  it('onResolve delega a facade.resolveAlarm', () => {
    component.onResolve('active-2');

    expect(alarmManagementStub.resolveAlarm).toHaveBeenCalledWith('active-2');
    expect(alarmManagementStub.resolveAlarm).toHaveBeenCalledTimes(1);
  });

  it('renderizza stato lista vuota quando non ci sono allarmi', () => {
    vmSubject.next({
      alarms: [],
      currentPage: 1,
      pageLimit: 6,
      pageOffset: 0,
      canGoPrevious: false,
      canGoNext: false,
      isResolving: false,
      resolvingId: null,
      resolveError: null,
    });

    fixture.detectChanges();
    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelector('.alarm-management__empty')?.textContent).toContain(
      'Nessun allarme attivo al momento.'
    );
    expect(nativeElement.querySelectorAll('tbody tr').length).toBe(0);
  });

  it('renderizza errore e stato resolving quando presenti nel vm', () => {
    vmSubject.next({
      alarms: [alarm1],
      currentPage: 1,
      pageLimit: 6,
      pageOffset: 0,
      canGoPrevious: false,
      canGoNext: false,
      isResolving: true,
      resolvingId: alarm1.id,
      resolveError: 'Errore durante la risoluzione',
    });

    fixture.detectChanges();
    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelector('.alarm-management__error')?.textContent).toContain(
      'Errore durante la risoluzione'
    );
    expect(nativeElement.querySelector('.alarm-management__status')?.textContent).toContain(
      'Risoluzione allarme in corso...'
    );
  });

  it('renderizza tabella con una riga per ogni allarme', () => {
    vmSubject.next({
      alarms: [alarm1, alarm2],
      currentPage: 1,
      pageLimit: 6,
      pageOffset: 0,
      canGoPrevious: false,
      canGoNext: true,
      isResolving: true,
      resolvingId: alarm2.id,
      resolveError: null,
    });

    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const rows = nativeElement.querySelectorAll('tbody tr');
    const manageButtons = nativeElement.querySelectorAll('button[aria-label^="Gestisci allarme"]');

    expect(rows.length).toBe(2);
    expect(nativeElement.textContent).toContain('Priorita');
    expect(nativeElement.textContent).toContain('Dispositivo');
    expect(nativeElement.textContent).toContain('Gestore');
    expect(nativeElement.textContent).toContain('device-1');
    expect(nativeElement.textContent).toContain('oss_1');
    expect(nativeElement.textContent).toContain('Corridoio Nord');
    expect(manageButtons.length).toBe(2);
    expect((manageButtons.item(1) as HTMLButtonElement).disabled).toBe(true);
  });

  it('nasconde la colonna gestore per operatore sanitario', () => {
    userSessionSubject.next({
      userId: '7',
      username: 'oss',
      role: UserRole.OPERATORE_SANITARIO,
      accessToken: 'token',
      isFirstAccess: false,
    });
    vmSubject.next({
      alarms: [alarm1],
      currentPage: 1,
      pageLimit: 6,
      pageOffset: 0,
      canGoPrevious: false,
      canGoNext: false,
      isResolving: false,
      resolvingId: null,
      resolveError: null,
    });

    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    expect(nativeElement.textContent).not.toContain('Gestore');
    expect(nativeElement.textContent).not.toContain('oss_1');
  });

  it('disabilita solo il bottone associato al resolvingId corrente', () => {
    vmSubject.next({
      alarms: [alarm1, alarm2],
      currentPage: 1,
      pageLimit: 6,
      pageOffset: 0,
      canGoPrevious: false,
      canGoNext: true,
      isResolving: true,
      resolvingId: alarm1.id,
      resolveError: null,
    });

    fixture.detectChanges();

    const firstButton = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-label="Gestisci allarme Antipanico"]'
    ) as HTMLButtonElement | null;
    const secondButton = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-label="Gestisci allarme Porta aperta"]'
    ) as HTMLButtonElement | null;

    expect(firstButton?.disabled).toBe(true);
    expect(secondButton?.disabled).toBe(false);
  });

  it('renderizza paginazione coerente con vm e delega i click ai metodi del service', () => {
    vmSubject.next({
      alarms: [alarm1],
      currentPage: 3,
      pageLimit: 6,
      pageOffset: 12,
      canGoPrevious: true,
      canGoNext: false,
      isResolving: false,
      resolvingId: null,
      resolveError: null,
    });

    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const previousButton = nativeElement.querySelector(
      'button[aria-label="Pagina precedente allarmi attivi"]'
    ) as HTMLButtonElement | null;
    const nextButton = nativeElement.querySelector(
      'button[aria-label="Pagina successiva allarmi attivi"]'
    ) as HTMLButtonElement | null;

    expect(nativeElement.querySelector('.alarm-pagination__status')?.textContent).toContain('Pagina 3');
    expect(previousButton?.disabled).toBe(false);
    expect(nextButton?.disabled).toBe(true);

    previousButton?.dispatchEvent(new MouseEvent('click'));

    expect(alarmManagementStub.previousPage).toHaveBeenCalledTimes(1);
    expect(alarmManagementStub.nextPage).not.toHaveBeenCalled();
  });

  it('click su GESTISCI propaga resolve verso facade', () => {
    vmSubject.next({
      alarms: [alarm1],
      currentPage: 1,
      pageLimit: 6,
      pageOffset: 0,
      canGoPrevious: false,
      canGoNext: false,
      isResolving: false,
      resolvingId: null,
      resolveError: null,
    });

    fixture.detectChanges();
    const manageButton = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-label="Gestisci allarme Antipanico"]'
    );

    manageButton?.dispatchEvent(new MouseEvent('click'));

    expect(alarmManagementStub.resolveAlarm).toHaveBeenCalledWith('active-1');
    expect(alarmManagementStub.resolveAlarm).toHaveBeenCalledTimes(1);
  });

  it('mantiene la riga visibile se l allarme e gia gestito e disabilita l azione', () => {
    vmSubject.next({
      alarms: [managedAlarm],
      currentPage: 2,
      pageLimit: 6,
      pageOffset: 6,
      canGoPrevious: true,
      canGoNext: false,
      isResolving: false,
      resolvingId: null,
      resolveError: null,
    });

    fixture.detectChanges();
    const nativeElement = fixture.nativeElement as HTMLElement;
    const rows = nativeElement.querySelectorAll('tbody tr');
    const managedButton = nativeElement.querySelector(
      'button[aria-label="Allarme gia gestito Antipanico"]'
    ) as HTMLButtonElement | null;

    expect(rows.length).toBe(1);
    expect(nativeElement.textContent).toContain('Non da gestire');
    expect(managedButton).not.toBeNull();
    expect(managedButton?.disabled).toBe(true);
    expect(managedButton?.textContent).toContain('GESTITO');
  });

  it('onNextPage e onPreviousPage delegano al service', () => {
    component.onNextPage();
    component.onPreviousPage();

    expect(alarmManagementStub.nextPage).toHaveBeenCalledTimes(1);
    expect(alarmManagementStub.previousPage).toHaveBeenCalledTimes(1);
  });
});
