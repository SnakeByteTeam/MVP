import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from 'src/app/core/models/user-role.enum';
import type { Ward } from 'src/app/features/ward-management/models/ward.model';
import { WardManagementStore } from 'src/app/features/ward-management/services/ward-management.store';

import { WardManagementPageComponent } from 'src/app/features/ward-management/components/ward-management-page-component/ward-management-page-component';

describe('WardManagementPageComponent', () => {
  let component: WardManagementPageComponent;
  let fixture: ComponentFixture<WardManagementPageComponent>;

  let wardsSubject: BehaviorSubject<Ward[]>;
  let loadingSubject: BehaviorSubject<boolean>;
  let errorSubject: BehaviorSubject<string | null>;

  const wardA: Ward = {
    id: 1,
    name: 'Cardiologia',
    apartments: [
      { id: '101', name: 'App. 101' },
      { id: '102', name: 'App. 102' },
    ],
    operators: [
      {
        id: 1,
        firstName: 'Mario',
        lastName: 'Rossi',
        username: 'mrossi',
        role: UserRole.OPERATORE_SANITARIO,
      },
    ],
  };

  const wardB: Ward = {
    id: 2,
    name: 'Neurologia',
    apartments: [
      { id: '102', name: 'App. 102' },
      { id: '103', name: 'App. 103' },
    ],
    operators: [],
  };

  const storeStub = {
    wards$: undefined as unknown,
    isLoading$: undefined as unknown,
    error$: undefined as unknown,
    loadWards: vi.fn(),
    createWard: vi.fn(),
    updateWard: vi.fn(),
    deleteWard: vi.fn(),
    assignOperator: vi.fn(),
    removeOperator: vi.fn(),
    assignPlant: vi.fn(),
    removePlant: vi.fn(),
    getAvailableUsersForWard: vi.fn(),
    getAvailablePlantsForWard: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    wardsSubject = new BehaviorSubject<Ward[]>([]);
    loadingSubject = new BehaviorSubject<boolean>(false);
    errorSubject = new BehaviorSubject<string | null>(null);

    storeStub.wards$ = wardsSubject.asObservable();
    storeStub.isLoading$ = loadingSubject.asObservable();
    storeStub.error$ = errorSubject.asObservable();
    storeStub.getAvailableUsersForWard.mockReturnValue(of([]));
    storeStub.getAvailablePlantsForWard.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [WardManagementPageComponent],
      providers: [{ provide: WardManagementStore, useValue: storeStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(WardManagementPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit dovrebbe chiamare loadWards e sincronizzare snapshots/error', () => {
    fixture.detectChanges();

    expect(storeStub.loadWards).toHaveBeenCalledTimes(1);
    expect(component.wardsSnapshot()).toEqual([]);
    expect(component.snackbarMessage()).toBeNull();

    wardsSubject.next([wardA, wardB]);
    errorSubject.next('Errore rete');

    expect(component.wardsSnapshot()).toHaveLength(2);
    expect(component.selectedWardId()).toBe(1);
    expect(component.snackbarMessage()).toBe('Errore rete');
  });

  it('quando wards diventa vuoto resetta selezioni e step mobile', () => {
    component.selectedWardId.set(wardA.id);
    component.selectedApartmentId.set('101');
    component.mobileStep.set('operators');

    fixture.detectChanges();
    wardsSubject.next([wardA]);
    wardsSubject.next([]);

    expect(component.selectedWardId()).toBeNull();
    expect(component.selectedApartmentId()).toBeNull();
    expect(component.mobileStep()).toBe('wards');
  });

  it('selectedApartment si riallinea al ward selezionato', () => {
    component.wardsSnapshot.set([wardA, wardB]);
    component.selectedWardId.set(wardA.id);
    component.selectedApartmentId.set('101');

    expect(component.selectedApartment()).toEqual({ id: '101', name: 'App. 101' });

    component.selectedWardId.set(wardB.id);

    expect(component.selectedApartment()).toBeNull();
  });

  it('ngOnDestroy dovrebbe interrompere aggiornamenti da stream', () => {
    fixture.detectChanges();

    errorSubject.next('Errore iniziale');
    expect(component.snackbarMessage()).toBe('Errore iniziale');

    component.ngOnDestroy();
    errorSubject.next('Errore dopo destroy');

    expect(component.snackbarMessage()).toBe('Errore iniziale');
  });

  it('dismissSnackbar dovrebbe azzerare il messaggio', () => {
    component.snackbarMessage.set('Boom');

    component.dismissSnackbar();

    expect(component.snackbarMessage()).toBeNull();
  });

  it('onCreateWard dovrebbe aprire dialog in create mode', () => {
    component.selectedWardId.set(wardA.id);

    component.onCreateWard();

    expect(component.selectedWardId()).toBe(wardA.id);
    expect(component.wardDialogMode()).toBe('create');
  });

  it('onCreateWardSubmit dovrebbe delegare a store e chiudere dialog', () => {
    component.wardDialogMode.set('create');

    component.onCreateWardSubmit({ name: 'Oncologia' });

    expect(storeStub.createWard).toHaveBeenCalledWith({ name: 'Oncologia' });
    expect(storeStub.createWard).toHaveBeenCalledTimes(1);
    expect(component.wardDialogMode()).toBe('closed');
  });

  it('onEditWard e onEditWardSubmit dovrebbero aggiornare il reparto selezionato', () => {
    component.wardsSnapshot.set([wardA, wardB]);

    component.onEditWard(wardA);
    expect(component.selectedWardId()).toBe(wardA.id);
    expect(component.wardDialogMode()).toBe('edit');

    component.onEditWardSubmit({ name: 'Cardiologia A' });

    expect(storeStub.updateWard).toHaveBeenCalledWith(1, { name: 'Cardiologia A' });
    expect(component.selectedWardId()).toBe(wardA.id);
    expect(component.wardDialogMode()).toBe('closed');
  });

  it('onEditWardSubmit non dovrebbe chiamare store se selectedWard e null', () => {
    component.wardsSnapshot.set([wardB]);
    component.selectedWardId.set(null);

    component.onEditWardSubmit({ name: 'X' });

    expect(storeStub.updateWard).not.toHaveBeenCalled();
  });

  it('onCloseWardDialog dovrebbe chiudere dialog e pulire selezione', () => {
    component.selectedWardId.set(wardA.id);
    component.wardDialogMode.set('edit');

    component.onCloseWardDialog();

    expect(component.selectedWardId()).toBe(wardA.id);
    expect(component.wardDialogMode()).toBe('closed');
  });

  it('onCloseAssignOperatorDialog e onCloseAssignPlantDialog ripuliscono stato di caricamento e lookup', () => {
    component.operatorWardId.set(wardA.id);
    component.availableOperatorsFromFetch.set([
      {
        id: 1,
        firstName: 'Mario',
        lastName: 'Rossi',
        username: 'mrossi',
        role: UserRole.OPERATORE_SANITARIO,
      },
    ]);
    component.isLoadingAvailableOperators.set(true);

    component.plantWardId.set(wardB.id);
    component.availablePlantsFromFetch.set([{ id: '101', name: 'App. 101' }]);
    component.isLoadingAvailablePlants.set(true);

    component.onCloseAssignOperatorDialog();
    component.onCloseAssignPlantDialog();

    expect(component.operatorWardId()).toBeNull();
    expect(component.availableOperatorsFromFetch()).toBeNull();
    expect(component.isLoadingAvailableOperators()).toBe(false);
    expect(component.plantWardId()).toBeNull();
    expect(component.availablePlantsFromFetch()).toBeNull();
    expect(component.isLoadingAvailablePlants()).toBe(false);
  });

  it('selectWard dovrebbe aggiornare ward attivo e step mobile', () => {
    component.selectWard(2);

    expect(component.selectedWardId()).toBe(2);
    expect(component.mobileStep()).toBe('apartments');
  });

  it('selectWard sul ward gia selezionato mantiene la selezione dell appartamento', () => {
    component.selectedWardId.set(wardA.id);
    component.selectedApartmentId.set('101');
    component.mobileStep.set('wards');

    component.selectWard(wardA.id);

    expect(component.selectedWardId()).toBe(wardA.id);
    expect(component.selectedApartmentId()).toBe('101');
    expect(component.mobileStep()).toBe('apartments');
  });

  it('selectApartment e step helpers dovrebbero aggiornare lo stato ui', () => {
    component.selectApartment('101');
    expect(component.selectedApartmentId()).toBe('101');

    component.showWardListStep();
    expect(component.mobileStep()).toBe('wards');

    component.showApartmentsStep();
    expect(component.mobileStep()).toBe('apartments');

    component.showOperatorsStep();
    expect(component.mobileStep()).toBe('operators');
  });

  it('onEditSelectedWard non dovrebbe fare nulla senza ward selezionato', () => {
    component.wardsSnapshot.set([wardA]);
    component.selectedWardId.set(null);

    component.onEditSelectedWard();

    expect(component.selectedWardId()).toBeNull();
    expect(component.wardDialogMode()).toBe('closed');
  });

  it('flow operator dovrebbe impostare wardId, submit e chiudere', () => {
    storeStub.getAvailableUsersForWard.mockReturnValue(
      of([
        {
          id: 2,
          firstName: 'Luca',
          lastName: 'Verdi',
          username: 'lverdi',
          role: UserRole.OPERATORE_SANITARIO,
        },
      ]),
    );

    component.onAssignOperator(1);
    expect(component.operatorWardId()).toBe(1);
    expect(storeStub.getAvailableUsersForWard).toHaveBeenCalledWith(1);
    expect(component.availableOperators()).toEqual([
      {
        id: 2,
        firstName: 'Luca',
        lastName: 'Verdi',
        username: 'lverdi',
        role: UserRole.OPERATORE_SANITARIO,
      },
    ]);

    component.onAssignOperatorSubmit({ userId: 2 });

    expect(storeStub.assignOperator).toHaveBeenCalledWith(1, { userId: 2 });
    expect(component.operatorWardId()).toBeNull();

    component.onAssignOperator(2);
    component.onCloseAssignOperatorDialog();
    expect(component.operatorWardId()).toBeNull();
  });

  it('onAssignOperatorSubmit non dovrebbe chiamare store senza wardId', () => {
    component.operatorWardId.set(null);

    component.onAssignOperatorSubmit({ userId: 2 });

    expect(storeStub.assignOperator).not.toHaveBeenCalled();
  });

  it('flow plant dovrebbe impostare wardId, submit e chiudere', () => {
    storeStub.getAvailablePlantsForWard.mockReturnValue(
      of([{ id: '103', name: 'App. 103' }]),
    );

    component.onAssignPlant(2);
    expect(component.plantWardId()).toBe(2);
    expect(storeStub.getAvailablePlantsForWard).toHaveBeenCalledWith(2);
    expect(component.availablePlants()).toEqual([{ id: '103', name: 'App. 103' }]);

    component.onAssignPlantSubmit({ plantId: '103' });

    expect(storeStub.assignPlant).toHaveBeenCalledWith(2, { plantId: '103' });
    expect(component.plantWardId()).toBeNull();

    component.onAssignPlant(1);
    component.onCloseAssignPlantDialog();
    expect(component.plantWardId()).toBeNull();
  });

  it('onAssignPlantSubmit non dovrebbe chiamare store senza wardId', () => {
    component.plantWardId.set(null);

    component.onAssignPlantSubmit({ plantId: '101' });

    expect(storeStub.assignPlant).not.toHaveBeenCalled();
  });

  it('confirmState + onConfirmDialogConfirmed dovrebbero gestire i 3 rami', () => {
    component.onDeleteWard(1);
    expect(component.confirmState()).toEqual({ kind: 'delete-ward', wardId: 1 });
    component.onConfirmDialogConfirmed();
    expect(storeStub.deleteWard).toHaveBeenCalledWith(1);
    expect(component.confirmState()).toBeNull();

    component.onRemoveOperator({ wardId: 1, userId: 2 });
    expect(component.confirmState()).toEqual({
      kind: 'remove-operator',
      wardId: 1,
      userId: 2,
    });
    component.onConfirmDialogConfirmed();
    expect(storeStub.removeOperator).toHaveBeenCalledWith(1, 2);
    expect(component.confirmState()).toBeNull();

    component.onRemovePlant({ wardId: 2, plantId: '103' });
    expect(component.confirmState()).toEqual({
      kind: 'remove-plant',
      wardId: 2,
      plantId: '103',
    });
    component.onConfirmDialogConfirmed();
    expect(storeStub.removePlant).toHaveBeenCalledWith(2, '103');
    expect(component.confirmState()).toBeNull();
  });

  it('onConfirmDialogConfirmed non dovrebbe fare nulla con stato nullo', () => {
    component.confirmState.set(null);

    component.onConfirmDialogConfirmed();

    expect(storeStub.deleteWard).not.toHaveBeenCalled();
    expect(storeStub.removeOperator).not.toHaveBeenCalled();
    expect(storeStub.removePlant).not.toHaveBeenCalled();
  });

  it('onConfirmDialogCancelled dovrebbe pulire confirmState', () => {
    component.confirmState.set({ kind: 'delete-ward', wardId: 1 });

    component.onConfirmDialogCancelled();

    expect(component.confirmState()).toBeNull();
  });

  it('getConfirmMessage dovrebbe restituire il testo corretto per ogni stato', () => {
    component.confirmState.set(null);
    expect(component.getConfirmMessage()).toBe('Confermi questa operazione?');
    expect(component.getConfirmLabel()).toBe('Conferma');

    component.confirmState.set({ kind: 'delete-ward', wardId: 1 });
    expect(component.getConfirmMessage()).toBe('Confermi l\'eliminazione del reparto?');
    expect(component.getConfirmLabel()).toBe('Conferma');

    component.confirmState.set({ kind: 'remove-operator', wardId: 1, userId: 2 });
    expect(component.getConfirmMessage()).toBe('Confermi la rimozione dell\'operatore dal reparto?');
    expect(component.getConfirmLabel()).toBe('Rimuovi');

    component.confirmState.set({ kind: 'remove-plant', wardId: 1, plantId: '101' });
    expect(component.getConfirmMessage()).toBe('Confermi la rimozione dell\'appartamento dal reparto?');
    expect(component.getConfirmLabel()).toBe('Rimuovi');
  });

  it('getOperatorDisplayName dovrebbe comporre e trimmare nome e cognome', () => {
    expect(component.getOperatorDisplayName('Mario', 'Rossi')).toBe('Mario Rossi');
    expect(component.getOperatorDisplayName('Mario', '')).toBe('Mario');
  });

  it('availablePlants dovrebbe deduplicare e escludere quelli gia assegnati al ward selezionato', () => {
    component.wardsSnapshot.set([wardA, wardB]);

    component.plantWardId.set(null);
    expect(component.availablePlants()).toEqual([]);

    component.plantWardId.set(1);
    expect(component.availablePlants()).toEqual([]);

    component.plantWardId.set(9999);
    expect(component.availablePlants()).toEqual([]);
  });

  it('onAssignPlant non usa fallback locale se fetch ad-hoc fallisce', () => {
    storeStub.getAvailablePlantsForWard.mockReturnValue(of(null));
    component.wardsSnapshot.set([wardA, wardB]);

    component.onAssignPlant(1);

    expect(component.availablePlants()).toEqual([]);
    expect(component.isLoadingAvailablePlants()).toBe(false);
  });

  describe('Template Interactions', () => {
    it('should render empty state if no wards exist', () => {
      wardsSubject.next([]);
      fixture.detectChanges();

      const el = fixture.nativeElement;
      expect(el.textContent).toContain('Nessun reparto disponibile');
      expect(el.textContent).toContain('Crea il primo reparto dal pannello');
    });

    it('should render ward list and select ward on click', () => {
      wardsSubject.next([wardA, wardB]);
      fixture.detectChanges();

      const items = Array.from(fixture.nativeElement.querySelectorAll('button')).filter((b: any) => 
         b.textContent.includes(wardA.name) || b.textContent.includes(wardB.name)
      ) as HTMLButtonElement[];
      
      expect(items.length).toBeGreaterThanOrEqual(2);
      
      // Select the second ward
      items.find(b => b.textContent.includes(wardB.name))?.click();
      fixture.detectChanges();
      
      expect(component.selectedWardId()).toBe(wardB.id);
    });

    it('should show apartments and operators for selected ward', () => {
      wardsSubject.next([wardA, wardB]);
      component.selectedWardId.set(wardA.id);
      fixture.detectChanges();

      const el = fixture.nativeElement;
      expect(el.textContent).toContain('Appartamenti');
      expect(el.textContent).toContain('Operatori');
    });

    it('should render create ward dialog when mode is create', () => {
      component.wardDialogMode.set('create');
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('app-ward-form-dialog-component');
      expect(dialog).toBeTruthy();
    });

    it('should render assign operator dialog when operatorWardId is set', () => {
      component.operatorWardId.set(wardA.id);
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('app-assign-operator-dialog-component');
      expect(dialog).toBeTruthy();
    });

    it('should show snackbar message when emitted', () => {
      errorSubject.next('Test error');
      fixture.detectChanges();

      const errorDiv = fixture.nativeElement.querySelector('.bg-red-50');
      expect(errorDiv.textContent).toContain('Test error');
      
      const dismissBtn = errorDiv.querySelector('button');
      dismissBtn.click();
      fixture.detectChanges();
      expect(component.snackbarMessage()).toBeNull();
    });

    it('selectApartment imposta il selectedApartmentId', () => {
      wardsSubject.next([wardA]);
      fixture.detectChanges();
      component.selectApartment('101');
      expect(component.selectedApartmentId()).toBe('101');
    });

    it('selectedApartment computed restituisce null se apartmentId non presente nel ward', () => {
      wardsSubject.next([wardA]);
      component.selectedWardId.set(wardA.id);
      component.selectedApartmentId.set('999'); // non-existent
      fixture.detectChanges();
      expect(component.selectedApartment()).toBeNull();
    });

    it('selectedApartment computed restituisce null se ward manca', () => {
      wardsSubject.next([wardA]);
      component.selectedWardId.set(999); // no such ward
      component.selectedApartmentId.set('101');
      fixture.detectChanges();
      expect(component.selectedApartment()).toBeNull();
    });

    it('wardDialogValue restituisce selectedWard in edit mode', () => {
      wardsSubject.next([wardA]);
      component.selectedWardId.set(wardA.id);
      component.wardDialogMode.set('edit');
      fixture.detectChanges();
      expect(component.wardDialogValue()).toEqual(wardA);
    });

    it('quando il ward selezionato viene rimosso, la selezione va al primo della lista', () => {
      wardsSubject.next([wardA, wardB]);
      fixture.detectChanges();
      component.selectedWardId.set(wardB.id);

      // Simulate wardB being removed
      wardsSubject.next([wardA]);
      fixture.detectChanges();
      expect(component.selectedWardId()).toBe(wardA.id);
    });

    it('se un appartamento selezionato viene rimosso dal ward, la selezione viene azzerata', () => {
      wardsSubject.next([wardA]);
      component.selectedWardId.set(wardA.id);
      component.selectedApartmentId.set('101');
      fixture.detectChanges();

      // Update wardA without apartment 101
      const wardAUpdated = { ...wardA, apartments: [{ id: '102', name: 'App. 102' }] };
      wardsSubject.next([wardAUpdated]);
      fixture.detectChanges();

      expect(component.selectedApartmentId()).toBeNull();
    });

    it('onEditSelectedWard e no-op se nessun ward e selezionato', () => {
      wardsSubject.next([wardA]);
      fixture.detectChanges();
      component.selectedWardId.set(null); // no selection
      component.onEditSelectedWard();
      expect(component.wardDialogMode()).not.toBe('edit');
    });

    it('selectWard con stesso id imposta mobileStep ad apartments senza cambiare id', () => {
      wardsSubject.next([wardA]);
      component.selectedWardId.set(wardA.id);
      fixture.detectChanges();
      component.selectWard(wardA.id);
      expect(component.mobileStep()).toBe('apartments');
      expect(component.selectedWardId()).toBe(wardA.id);
    });

    it('showWardListStep / showApartmentsStep / showOperatorsStep impostano il mobile step', () => {
      fixture.detectChanges();
      component.showOperatorsStep();
      expect(component.mobileStep()).toBe('operators');
      component.showApartmentsStep();
      expect(component.mobileStep()).toBe('apartments');
      component.showWardListStep();
      expect(component.mobileStep()).toBe('wards');
    });

    it('getConfirmMessage e getConfirmLabel per ogni stato', () => {
      fixture.detectChanges();
      expect(component.getConfirmMessage()).toBe('Confermi questa operazione?');
      expect(component.getConfirmLabel()).toBe('Conferma');

      component.confirmState.set({ kind: 'delete-ward', wardId: 1 });
      expect(component.getConfirmMessage()).toContain('eliminazione del reparto');
      expect(component.getConfirmLabel()).toBe('Conferma');

      component.confirmState.set({ kind: 'remove-operator', wardId: 1, userId: 1 });
      expect(component.getConfirmMessage()).toContain('rimozione dell');
      expect(component.getConfirmLabel()).toBe('Rimuovi');

      component.confirmState.set({ kind: 'remove-plant', wardId: 1, plantId: 'p1' });
      expect(component.getConfirmMessage()).toContain('appartamento dal reparto');
      expect(component.getConfirmLabel()).toBe('Rimuovi');
    });

    it('onConfirmDialogConfirmed gestisce tutti i tipi di confirmState', () => {
      fixture.detectChanges();

      component.confirmState.set({ kind: 'delete-ward', wardId: 1 });
      component.onConfirmDialogConfirmed();
      expect(storeStub.deleteWard).toHaveBeenCalledWith(1);
      expect(component.confirmState()).toBeNull();

      component.confirmState.set({ kind: 'remove-operator', wardId: 1, userId: 5 });
      component.onConfirmDialogConfirmed();
      expect(storeStub.removeOperator).toHaveBeenCalledWith(1, 5);

      component.confirmState.set({ kind: 'remove-plant', wardId: 1, plantId: 'plant-x' });
      component.onConfirmDialogConfirmed();
      expect(storeStub.removePlant).toHaveBeenCalledWith(1, 'plant-x');

      // state = null → no-op
      component.confirmState.set(null);
      component.onConfirmDialogConfirmed();
    });

    it('getOperatorDisplayName restituisce nome e cognome combinati', () => {
      fixture.detectChanges();
      expect(component.getOperatorDisplayName('Mario', 'Rossi')).toBe('Mario Rossi');
      expect(component.getOperatorDisplayName('  ', '  ')).toBe('');
    });
  });
});
