import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import type { RemovePlantEvent, RemoveOperatorEvent } from '../../models/plant-management.events';
import type { Ward } from '../../models/ward.model';
import { ApartmentRowComponent } from '../apartment-row-component/apartment-row-component';

@Component({
  selector: 'app-ward-card-component',
  imports: [ApartmentRowComponent],
  templateUrl: './ward-card-component.html',
  styleUrl: './ward-card-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WardCardComponent {
  public readonly ward = input<Ward | null>(null);

  public readonly editWard = output<Ward>();
  public readonly deleteWard = output<number>();
  public readonly assignOperator = output<number>();
  public readonly removeOperator = output<RemoveOperatorEvent>();
  public readonly assignPlant = output<number>();
  public readonly removePlant = output<RemovePlantEvent>();
  public readonly enablePlant = output<number>();
  public readonly disablePlant = output<number>();

  private readonly isExpandedSignal = signal(false);
  public readonly isExpanded = computed(() => this.isExpandedSignal());

  public toggleExpanded(): void {
    this.isExpandedSignal.update((value) => !value);
  }

  public onEditWardClick(): void {
    const ward = this.ward();
    if (ward) {
      this.editWard.emit(ward);
    }
  }

  public onDeleteWardClick(): void {
    const ward = this.ward();
    if (ward) {
      this.deleteWard.emit(ward.id);
    }
  }

  public onAssignOperatorClick(): void {
    const ward = this.ward();
    if (ward) {
      this.assignOperator.emit(ward.id);
    }
  }

  public onRemoveOperatorClick(userId: number): void {
    const ward = this.ward();
    if (ward) {
      this.removeOperator.emit({ wardId: ward.id, userId });
    }
  }

  public onAssignPlantClick(): void {
    const ward = this.ward();
    if (ward) {
      this.assignPlant.emit(ward.id);
    }
  }

  public onRemovePlantClick(plantId: number): void {
    const ward = this.ward();
    if (ward) {
      this.removePlant.emit({ wardId: ward.id, plantId });
    }
  }

  public onEnablePlant(plantId: number): void {
    this.enablePlant.emit(plantId);
  }

  public onDisablePlant(plantId: number): void {
    this.disablePlant.emit(plantId);
  }
}
