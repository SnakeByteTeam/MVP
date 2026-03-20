import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import type { RemoveApartmentEvent, RemoveOperatorEvent } from '../../models/plant-management.events';
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
  public readonly deleteWard = output<string>();
  public readonly assignOperator = output<string>();
  public readonly removeOperator = output<RemoveOperatorEvent>();
  public readonly assignApartment = output<string>();
  public readonly removeApartment = output<RemoveApartmentEvent>();
  public readonly enableApartment = output<string>();
  public readonly disableApartment = output<string>();

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

  public onRemoveOperatorClick(userId: string): void {
    const ward = this.ward();
    if (ward) {
      this.removeOperator.emit({ wardId: ward.id, userId });
    }
  }

  public onAssignApartmentClick(): void {
    const ward = this.ward();
    if (ward) {
      this.assignApartment.emit(ward.id);
    }
  }

  public onRemoveApartmentClick(apartmentId: string): void {
    const ward = this.ward();
    if (ward) {
      this.removeApartment.emit({ wardId: ward.id, apartmentId });
    }
  }

  public onEnableApartment(apartmentId: string): void {
    this.enableApartment.emit(apartmentId);
  }

  public onDisableApartment(apartmentId: string): void {
    this.disableApartment.emit(apartmentId);
  }
}
