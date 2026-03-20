import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../../../core/models/user-role.enum';
import type { Ward } from '../../models/ward.model';
import { PlantManagementStore } from '../../services/plant-management.store';

import { PlantManagementPageComponent } from './plant-management-page-component';

describe('PlantManagementPageComponent', () => {
  let component: PlantManagementPageComponent;
  let fixture: ComponentFixture<PlantManagementPageComponent>;

  let wardsSubject: BehaviorSubject<Ward[]>;
  let loadingSubject: BehaviorSubject<boolean>;
  let errorSubject: BehaviorSubject<string | null>;

  const wardA: Ward = {
    id: 'ward-1',
    name: 'Cardiologia',
    apartments: [
      { id: 'apt-1', name: 'App. 101', isEnabled: true },
      { id: 'apt-2', name: 'App. 102', isEnabled: false },
    ],
    operators: [
      {
        id: 'user-1',
        firstName: 'Mario',
        lastName: 'Rossi',
        username: 'mrossi',
        role: UserRole.OPERATORE_SANITARIO,
      },
    ],
  };

  const wardB: Ward = {
    id: 'ward-2',
    name: 'Neurologia',
    apartments: [
      { id: 'apt-2', name: 'App. 102', isEnabled: false },
      { id: 'apt-3', name: 'App. 103', isEnabled: true },
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
    assignApartment: vi.fn(),
    removeApartment: vi.fn(),
    enableApartment: vi.fn(),
    disableApartment: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    wardsSubject = new BehaviorSubject<Ward[]>([]);
    loadingSubject = new BehaviorSubject<boolean>(false);
    errorSubject = new BehaviorSubject<string | null>(null);

    storeStub.wards$ = wardsSubject.asObservable();
    storeStub.isLoading$ = loadingSubject.asObservable();
    storeStub.error$ = errorSubject.asObservable();

    await TestBed.configureTestingModule({
      imports: [PlantManagementPageComponent],
      providers: [{ provide: PlantManagementStore, useValue: storeStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantManagementPageComponent);
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
    expect(component.snackbarMessage()).toBe('Errore rete');
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
    component.selectedWard.set(wardA);

    component.onCreateWard();

    expect(component.selectedWard()).toBeNull();
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
    component.onEditWard(wardA);
    expect(component.selectedWard()).toEqual(wardA);
    expect(component.wardDialogMode()).toBe('edit');

    component.onEditWardSubmit({ name: 'Cardiologia A' });

    expect(storeStub.updateWard).toHaveBeenCalledWith('ward-1', { name: 'Cardiologia A' });
    expect(component.selectedWard()).toBeNull();
    expect(component.wardDialogMode()).toBe('closed');
  });

  it('onEditWardSubmit non dovrebbe chiamare store se selectedWard e null', () => {
    component.selectedWard.set(null);

    component.onEditWardSubmit({ name: 'X' });

    expect(storeStub.updateWard).not.toHaveBeenCalled();
  });

  it('onCloseWardDialog dovrebbe chiudere dialog e pulire selezione', () => {
    component.selectedWard.set(wardA);
    component.wardDialogMode.set('edit');

    component.onCloseWardDialog();

    expect(component.selectedWard()).toBeNull();
    expect(component.wardDialogMode()).toBe('closed');
  });

  it('flow operator dovrebbe impostare wardId, submit e chiudere', () => {
    component.onAssignOperator('ward-1');
    expect(component.operatorWardId()).toBe('ward-1');

    component.onAssignOperatorSubmit({ userId: 'user-2' });

    expect(storeStub.assignOperator).toHaveBeenCalledWith('ward-1', { userId: 'user-2' });
    expect(component.operatorWardId()).toBeNull();

    component.onAssignOperator('ward-2');
    component.onCloseAssignOperatorDialog();
    expect(component.operatorWardId()).toBeNull();
  });

  it('onAssignOperatorSubmit non dovrebbe chiamare store senza wardId', () => {
    component.operatorWardId.set(null);

    component.onAssignOperatorSubmit({ userId: 'user-2' });

    expect(storeStub.assignOperator).not.toHaveBeenCalled();
  });

  it('flow apartment dovrebbe impostare wardId, submit e chiudere', () => {
    component.onAssignApartment('ward-2');
    expect(component.apartmentWardId()).toBe('ward-2');

    component.onAssignApartmentSubmit({ apartmentId: 'apt-3' });

    expect(storeStub.assignApartment).toHaveBeenCalledWith('ward-2', { apartmentId: 'apt-3' });
    expect(component.apartmentWardId()).toBeNull();

    component.onAssignApartment('ward-1');
    component.onCloseAssignApartmentDialog();
    expect(component.apartmentWardId()).toBeNull();
  });

  it('onAssignApartmentSubmit non dovrebbe chiamare store senza wardId', () => {
    component.apartmentWardId.set(null);

    component.onAssignApartmentSubmit({ apartmentId: 'apt-1' });

    expect(storeStub.assignApartment).not.toHaveBeenCalled();
  });

  it('onEnableApartment e onDisableApartment dovrebbero delegare allo store', () => {
    component.onEnableApartment('apt-9');
    component.onDisableApartment('apt-10');

    expect(storeStub.enableApartment).toHaveBeenCalledWith('apt-9');
    expect(storeStub.disableApartment).toHaveBeenCalledWith('apt-10');
  });

  it('confirmState + onConfirmDialogConfirmed dovrebbero gestire i 3 rami', () => {
    component.onDeleteWard('ward-1');
    expect(component.confirmState()).toEqual({ kind: 'delete-ward', wardId: 'ward-1' });
    component.onConfirmDialogConfirmed();
    expect(storeStub.deleteWard).toHaveBeenCalledWith('ward-1');
    expect(component.confirmState()).toBeNull();

    component.onRemoveOperator({ wardId: 'ward-1', userId: 'user-2' });
    expect(component.confirmState()).toEqual({
      kind: 'remove-operator',
      wardId: 'ward-1',
      userId: 'user-2',
    });
    component.onConfirmDialogConfirmed();
    expect(storeStub.removeOperator).toHaveBeenCalledWith('ward-1', 'user-2');
    expect(component.confirmState()).toBeNull();

    component.onRemoveApartment({ wardId: 'ward-2', apartmentId: 'apt-3' });
    expect(component.confirmState()).toEqual({
      kind: 'remove-apartment',
      wardId: 'ward-2',
      apartmentId: 'apt-3',
    });
    component.onConfirmDialogConfirmed();
    expect(storeStub.removeApartment).toHaveBeenCalledWith('ward-2', 'apt-3');
    expect(component.confirmState()).toBeNull();
  });

  it('onConfirmDialogConfirmed non dovrebbe fare nulla con stato nullo', () => {
    component.confirmState.set(null);

    component.onConfirmDialogConfirmed();

    expect(storeStub.deleteWard).not.toHaveBeenCalled();
    expect(storeStub.removeOperator).not.toHaveBeenCalled();
    expect(storeStub.removeApartment).not.toHaveBeenCalled();
  });

  it('onConfirmDialogCancelled dovrebbe pulire confirmState', () => {
    component.confirmState.set({ kind: 'delete-ward', wardId: 'ward-1' });

    component.onConfirmDialogCancelled();

    expect(component.confirmState()).toBeNull();
  });

  it('getConfirmMessage dovrebbe restituire il testo corretto per ogni stato', () => {
    component.confirmState.set(null);
    expect(component.getConfirmMessage()).toBe('Confermi questa operazione?');

    component.confirmState.set({ kind: 'delete-ward', wardId: 'ward-1' });
    expect(component.getConfirmMessage()).toBe('Confermi l\'eliminazione del reparto?');

    component.confirmState.set({ kind: 'remove-operator', wardId: 'ward-1', userId: 'user-2' });
    expect(component.getConfirmMessage()).toBe('Confermi la rimozione dell\'operatore dal reparto?');

    component.confirmState.set({ kind: 'remove-apartment', wardId: 'ward-1', apartmentId: 'apt-1' });
    expect(component.getConfirmMessage()).toBe('Confermi la rimozione dell\'appartamento dal reparto?');
    expect(component.getConfirmLabel()).toBe('Conferma');
  });

  it('availableApartments dovrebbe deduplicare e escludere quelli gia assegnati al ward selezionato', () => {
    component.wardsSnapshot.set([wardA, wardB]);

    component.apartmentWardId.set(null);
    expect(component.availableApartments()).toEqual([]);

    component.apartmentWardId.set('ward-1');
    expect(component.availableApartments()).toEqual([
      { id: 'apt-3', name: 'App. 103', isEnabled: true },
    ]);

    component.apartmentWardId.set('ward-unknown');
    expect(component.availableApartments()).toEqual([]);
  });
});
