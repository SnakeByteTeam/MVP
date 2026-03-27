import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import type { Plant } from '../../models/plant.model';
import type { AssignPlantDto, AssignOperatorDto, CreateWardDto, UpdateWardDto } from '../../models/ward-api.dto';
import type { RemovePlantEvent, RemoveOperatorEvent } from '../../models/ward-management.events';
import type { Ward } from '../../models/ward.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { WardManagementStore } from '../../services/ward-management.store';
import { AssignWardDialogComponent } from '../assign-ward-dialog-component/assign-ward-dialog-component';
import { AssignOperatorDialogComponent } from '../assign-operator-dialog-component/assign-operator-dialog-component';
import { WardFormDialogComponent } from '../ward-form-dialog-component/ward-form-dialog-component';

@Component({
  selector: 'app-ward-management-page-component',
  imports: [
    AsyncPipe,
    NgClass,
    WardFormDialogComponent,
    AssignOperatorDialogComponent,
    AssignWardDialogComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './ward-management-page-component.html',
  styleUrl: './ward-management-page-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WardManagementPageComponent implements OnInit, OnDestroy {
  private readonly store = inject(WardManagementStore);
  private readonly destroy$ = new Subject<void>();

  public readonly wards$ = this.store.wards$;
  public readonly isLoading$ = this.store.isLoading$;
  public readonly error$ = this.store.error$;

  public readonly snackbarMessage = signal<string | null>(null);
  public readonly wardDialogMode = signal<'closed' | 'create' | 'edit'>('closed');
  public readonly selectedWardId = signal<number | null>(null);
  public readonly selectedApartmentId = signal<number | null>(null);
  public readonly mobileStep = signal<'wards' | 'apartments' | 'operators'>('wards');
  public readonly operatorWardId = signal<number | null>(null);
  public readonly plantWardId = signal<number | null>(null);
  public readonly confirmState = signal<
    | { kind: 'delete-ward'; wardId: number }
    | { kind: 'remove-operator'; wardId: number; userId: number }
    | { kind: 'remove-plant'; wardId: number; plantId: number }
    | null
  >(null);

  public readonly wardsSnapshot = signal<Ward[]>([]);
  public readonly selectedWard = computed<Ward | null>(() => {
    const wardId = this.selectedWardId();
    if (!wardId) {
      return null;
    }

    return this.wardsSnapshot().find((ward) => ward.id === wardId) ?? null;
  });

  public readonly selectedApartment = computed<Plant | null>(() => {
    const apartmentId = this.selectedApartmentId();
    const ward = this.selectedWard();
    if (!apartmentId || !ward) {
      return null;
    }

    return ward.apartments.find((apartment) => apartment.id === apartmentId) ?? null;
  });

  public readonly wardDialogValue = computed<Ward | null>(() => {
    if (this.wardDialogMode() !== 'edit') {
      return null;
    }

    return this.selectedWard();
  });

  public readonly availablePlants = computed<Plant[]>(() => {
    const selectedWardId = this.plantWardId();
    if (!selectedWardId) {
      return [];
    }

    const wards = this.wardsSnapshot();
    const selectedWard = wards.find((ward) => ward.id === selectedWardId);
    if (!selectedWard) {
      return [];
    }

    const assignedToSelected = new Set(selectedWard.apartments.map((plant) => plant.id));
    const knownPlants = wards.flatMap((ward) => ward.apartments);
    const uniquePlants = new Map<number, Plant>();
    for (const plant of knownPlants) {
      if (!uniquePlants.has(plant.id) && !assignedToSelected.has(plant.id)) {
        uniquePlants.set(plant.id, plant);
      }
    }

    return Array.from(uniquePlants.values());
  });

  public ngOnInit(): void {
    this.store.loadWards();

    this.wards$.pipe(takeUntil(this.destroy$)).subscribe((wards) => {
      this.wardsSnapshot.set(wards);

      if (wards.length === 0) {
        this.selectedWardId.set(null);
        this.selectedApartmentId.set(null);
        this.mobileStep.set('wards');
        return;
      }

      const selectedWardId = this.selectedWardId();
      const selectedWardExists = selectedWardId !== null && wards.some((ward) => ward.id === selectedWardId);

      if (!selectedWardExists) {
        this.selectedWardId.set(wards[0].id);
        this.selectedApartmentId.set(null);
      }

      const selectedApartmentId = this.selectedApartmentId();
      if (selectedApartmentId !== null) {
        const activeWard = wards.find((ward) => ward.id === this.selectedWardId());
        const apartmentStillExists = activeWard?.apartments.some((apartment) => apartment.id === selectedApartmentId) ?? false;
        if (!apartmentStillExists) {
          this.selectedApartmentId.set(null);
        }
      }
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

  public selectWard(wardId: number): void {
    if (this.selectedWardId() === wardId) {
      this.mobileStep.set('apartments');
      return;
    }

    this.selectedWardId.set(wardId);
    this.selectedApartmentId.set(null);
    this.mobileStep.set('apartments');
  }

  public selectApartment(apartmentId: number): void {
    this.selectedApartmentId.set(apartmentId);
  }

  public showWardListStep(): void {
    this.mobileStep.set('wards');
  }

  public showApartmentsStep(): void {
    this.mobileStep.set('apartments');
  }

  public showOperatorsStep(): void {
    this.mobileStep.set('operators');
  }

  public onCreateWard(): void {
    this.wardDialogMode.set('create');
  }

  public onCreateWardSubmit(dto: CreateWardDto): void {
    this.store.createWard(dto);
    this.wardDialogMode.set('closed');
  }

  public onEditWard(ward: Ward): void {
    this.selectedWardId.set(ward.id);
    this.wardDialogMode.set('edit');
  }

  public onEditWardSubmit(dto: UpdateWardDto): void {
    const ward = this.selectedWard();
    if (!ward) {
      return;
    }

    this.store.updateWard(ward.id, dto);
    this.wardDialogMode.set('closed');
  }

  public onCloseWardDialog(): void {
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

  public getOperatorDisplayName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`.trim();
  }
}
