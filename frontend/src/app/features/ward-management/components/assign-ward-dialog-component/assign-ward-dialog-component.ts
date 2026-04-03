import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Plant } from '../../models/plant.model';
import type { AssignPlantDto } from '../../models/ward-api.dto';
import type { Ward } from '../../models/ward.model';

@Component({
  selector: 'app-assign-ward-dialog-component',
  imports: [ReactiveFormsModule],
  templateUrl: './assign-ward-dialog-component.html',
  styleUrl: './assign-ward-dialog-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignWardDialogComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  public readonly wardId = input<number>(0);
  public readonly availableWards = input<Ward[]>([]);
  public readonly availablePlants = input<Plant[]>([]);
  public readonly submitted = output<AssignPlantDto>();
  public readonly cancelled = output<void>();

  public readonly form = this.formBuilder.group({
    plantId: this.formBuilder.control<string | null>(null, { validators: [Validators.required] }),
  });

  public ngOnInit(): void {
    this.form.reset({ plantId: null });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const plantId = this.form.controls.plantId.value;
    if (plantId === null) {
      return;
    }

    this.submitted.emit({ plantId });
  }

  public onCancel(): void {
    this.cancelled.emit();
  }
}
