import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Apartment } from '../../models/apartment.model';
import type { AssignPlantDto } from '../../models/plant-api.dto';
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
  public readonly availablePlants = input<Apartment[]>([]);
  public readonly submitted = output<AssignPlantDto>();
  public readonly cancelled = output<void>();

  public readonly form = this.formBuilder.group({
    plantId: this.formBuilder.control<number | null>(null, { validators: [Validators.required] }),
  });

  public ngOnInit(): void {
    this.form.reset({ plantId: null });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit({ plantId: this.form.controls.plantId.value! });
  }

  public onCancel(): void {
    this.cancelled.emit();
  }
}
