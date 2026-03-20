import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { CreateWardDto } from '../../models/plant-api.dto';
import type { Ward } from '../../models/ward.model';

@Component({
  selector: 'app-ward-form-dialog-component',
  imports: [ReactiveFormsModule],
  templateUrl: './ward-form-dialog-component.html',
  styleUrl: './ward-form-dialog-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WardFormDialogComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  public readonly ward = input<Ward | null>(null);
  public readonly submitted = output<CreateWardDto>();
  public readonly cancelled = output<void>();

  public readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
  });

  public readonly isEditMode = computed(() => this.ward() !== null);

  public ngOnInit(): void {
    const ward = this.ward();
    if (ward) {
      this.form.patchValue({ name: ward.name });
    }
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: CreateWardDto = { name: this.form.controls.name.value.trim() };
    this.submitted.emit(dto);
  }

  public onCancel(): void {
    this.cancelled.emit();
  }
}
