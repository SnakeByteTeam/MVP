import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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
}
