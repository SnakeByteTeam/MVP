import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Plant } from '../../models/plant.model';

@Component({
  selector: 'app-ward-row-component',
  imports: [],
  templateUrl: './ward-row-component.html',
  styleUrl: './ward-row-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WardRowComponent {
  public readonly plant = input<Plant | null>(null);
  public readonly wardId = input<number>(0);

  public readonly enable = output<number>();
  public readonly disable = output<number>();

  public onToggle(): void {
    const plant = this.plant();
    if (!plant) {
      return;
    }

    if (plant.isEnabled) {
      this.disable.emit(plant.id);
      return;
    }

    this.enable.emit(plant.id);
  }
}
