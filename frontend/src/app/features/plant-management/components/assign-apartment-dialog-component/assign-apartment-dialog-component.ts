import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Apartment } from '../../models/apartment.model';
import type { AssignApartmentDto } from '../../models/plant-api.dto';
import type { Ward } from '../../models/ward.model';

@Component({
  selector: 'app-assign-apartment-dialog-component',
  imports: [ReactiveFormsModule],
  templateUrl: './assign-apartment-dialog-component.html',
  styleUrl: './assign-apartment-dialog-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignApartmentDialogComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  public readonly wardId = input<string>('');
  public readonly availableWards = input<Ward[]>([]);
  public readonly availableApartments = input<Apartment[]>([]);
  public readonly submitted = output<AssignApartmentDto>();
  public readonly cancelled = output<void>();

  public readonly form = this.formBuilder.nonNullable.group({
    apartmentId: ['', [Validators.required]],
  });

  public ngOnInit(): void {
    this.form.reset({ apartmentId: '' });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit({ apartmentId: this.form.controls.apartmentId.value });
  }

  public onCancel(): void {
    this.cancelled.emit();
  }
}
