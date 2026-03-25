import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import type { Apartment } from '../../models/apartment.model';
import type { AssignPlantDto, AssignOperatorDto, CreateWardDto, UpdateWardDto } from '../../models/plant-api.dto';
import type { RemovePlantEvent, RemoveOperatorEvent } from '../../models/plant-management.events';
import type { Ward } from '../../models/ward.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PlantManagementStore } from '../../services/plant-management.store';
import { AssignApartmentDialogComponent } from '../assign-apartment-dialog-component/assign-apartment-dialog-component';
import { AssignOperatorDialogComponent } from '../assign-operator-dialog-component/assign-operator-dialog-component';
import { WardCardComponent } from '../ward-card-component/ward-card-component';
import { WardFormDialogComponent } from '../ward-form-dialog-component/ward-form-dialog-component';

@Component({
  selector: 'app-plant-management-page-component',
  imports: [
    AsyncPipe,
    WardCardComponent,
    WardFormDialogComponent,
    AssignOperatorDialogComponent,
    AssignApartmentDialogComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './plant-management-page-component.html',
  styleUrl: './plant-management-page-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlantManagementPageComponent implements OnInit, OnDestroy {
  private readonly store = inject(PlantManagementStore);
  private readonly destroy$ = new Subject<void>();

  public readonly wards$ = this.store.wards$;
  public readonly isLoading$ = this.store.isLoading$;
  public readonly error$ = this.store.error$;

  public readonly snackbarMessage = signal<string | null>(null);
  public readonly wardDialogMode = signal<'closed' | 'create' | 'edit'>('closed');
  public readonly selectedWard = signal<Ward | null>(null);
  public readonly operatorWardId = signal<number | null>(null);
  public readonly plantWardId = signal<number | null>(null);
  public readonly confirmState = signal<
    | { kind: 'delete-ward'; wardId: number }
    | { kind: 'remove-operator'; wardId: number; userId: number }
    | { kind: 'remove-plant'; wardId: number; plantId: number }
    | null
  >(null);

  public readonly wardsSnapshot = signal<Ward[]>([]);
  public readonly wardDialogValue = computed<Ward | null>(() => {
    if (this.wardDialogMode() !== 'edit') {
      return null;
    }

    return this.selectedWard();
  });

  public readonly availablePlants = computed<Apartment[]>(() => {
    const selectedWardId = this.plantWardId();
    if (!selectedWardId) {
      return [];
    }

    const wards = this.wardsSnapshot();
    const selectedWard = wards.find((ward) => ward.id === selectedWardId);
    if (!selectedWard) {
      return [];
    }

    const assignedToSelected = new Set(selectedWard.apartments.map((apartment) => apartment.id));
    const knownApartments = wards.flatMap((ward) => ward.apartments);
    const uniqueApartments = new Map<number, Apartment>();
    for (const apartment of knownApartments) {
      if (!uniqueApartments.has(apartment.id) && !assignedToSelected.has(apartment.id)) {
        uniqueApartments.set(apartment.id, apartment);
      }
    }

    return Array.from(uniqueApartments.values());
  });

  public ngOnInit(): void {
    this.store.loadWards();

    this.wards$.pipe(takeUntil(this.destroy$)).subscribe((wards) => {
      this.wardsSnapshot.set(wards);
    });

    this.error$.pipe(takeUntil(this.destroy$)).subscribe((message) => {
      this.snackbarMessage.set(message);
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public dismissSnackbar(): void {
    this.snackbarMessage.set(null);
  }

  public onCreateWard(): void {
    this.selectedWard.set(null);
    this.wardDialogMode.set('create');
  }

  public onCreateWardSubmit(dto: CreateWardDto): void {
    this.store.createWard(dto);
    this.wardDialogMode.set('closed');
  }

  public onEditWard(ward: Ward): void {
    this.selectedWard.set(ward);
    this.wardDialogMode.set('edit');
  }

  public onEditWardSubmit(dto: UpdateWardDto): void {
    const ward = this.selectedWard();
    if (!ward) {
      return;
    }

    this.store.updateWard(ward.id, dto);
    this.selectedWard.set(null);
    this.wardDialogMode.set('closed');
  }

  public onCloseWardDialog(): void {
    this.selectedWard.set(null);
    this.wardDialogMode.set('closed');
  }

  public onDeleteWard(wardId: number): void {
    this.confirmState.set({ kind: 'delete-ward', wardId });
  }

  public onAssignOperator(wardId: number): void {
    this.operatorWardId.set(wardId);
  }

  public onAssignOperatorSubmit(dto: AssignOperatorDto): void {
    const wardId = this.operatorWardId();
    if (!wardId) {
      return;
    }

    this.store.assignOperator(wardId, dto);
    this.operatorWardId.set(null);
  }

  public onCloseAssignOperatorDialog(): void {
    this.operatorWardId.set(null);
  }

  public onRemoveOperator(event: RemoveOperatorEvent): void {
    this.confirmState.set({ kind: 'remove-operator', wardId: event.wardId, userId: event.userId });
  }

  public onAssignPlant(wardId: number): void {
    this.plantWardId.set(wardId);
  }

  public onAssignPlantSubmit(dto: AssignPlantDto): void {
    const wardId = this.plantWardId();
    if (!wardId) {
      return;
    }

    this.store.assignPlant(wardId, dto);
    this.plantWardId.set(null);
  }

  public onCloseAssignPlantDialog(): void {
    this.plantWardId.set(null);
  }

  public onRemovePlant(event: RemovePlantEvent): void {
    this.confirmState.set({
      kind: 'remove-plant',
      wardId: event.wardId,
      plantId: event.plantId,
    });
  }

  public onEnablePlant(plantId: number): void {
    this.store.enablePlant(plantId);
  }

  public onDisablePlant(plantId: number): void {
    this.store.disablePlant(plantId);
  }

  public onConfirmDialogConfirmed(): void {
    const state = this.confirmState();
    if (!state) {
      return;
    }

    if (state.kind === 'delete-ward') {
      this.store.deleteWard(state.wardId);
    }

    if (state.kind === 'remove-operator') {
      this.store.removeOperator(state.wardId, state.userId);
    }

    if (state.kind === 'remove-plant') {
      this.store.removePlant(state.wardId, state.plantId);
    }

    this.confirmState.set(null);
  }

  public onConfirmDialogCancelled(): void {
    this.confirmState.set(null);
  }

  public getConfirmMessage(): string {
    const state = this.confirmState();
    if (!state) {
      return 'Confermi questa operazione?';
    }

    if (state.kind === 'delete-ward') {
      return 'Confermi l\'eliminazione del reparto?';
    }

    if (state.kind === 'remove-operator') {
      return 'Confermi la rimozione dell\'operatore dal reparto?';
    }

    return 'Confermi la rimozione dell\'appartamento dal reparto?';
  }

  public getConfirmLabel(): string {
    return 'Conferma';
  }
}
