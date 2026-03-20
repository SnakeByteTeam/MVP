import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Apartment } from '../../models/apartment.model';

@Component({
  selector: 'app-apartment-row-component',
  imports: [],
  templateUrl: './apartment-row-component.html',
  styleUrl: './apartment-row-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApartmentRowComponent {
  public readonly apartment = input<Apartment | null>(null);
  public readonly wardId = input<string>('');

  public readonly enable = output<string>();
  public readonly disable = output<string>();

  public onToggle(): void {
    const apartment = this.apartment();
    if (!apartment) {
      return;
    }

    if (apartment.isEnabled) {
      this.disable.emit(apartment.id);
      return;
    }

    this.enable.emit(apartment.id);
  }
}
