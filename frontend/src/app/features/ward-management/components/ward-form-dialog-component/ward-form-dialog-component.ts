import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { CreateWardDto } from '../../models/ward-api.dto';
import type { Ward } from '../../models/ward.model';

@Component({
  selector: 'app-ward-form-dialog-component',
  imports: [ReactiveFormsModule],
  templateUrl: './ward-form-dialog-component.html',
  styleUrl: './ward-form-dialog-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WardFormDialogComponent {
  private readonly formBuilder = inject(FormBuilder);

  public readonly ward = input<Ward | null>(null);
  public readonly submitted = output<CreateWardDto>();
  public readonly cancelled = output<void>();

  public readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
  });

  private readonly syncFormWithWard = effect(() => {
    const ward = this.ward();
    this.form.patchValue({ name: ward?.name ?? '' }, { emitEvent: false });
  });

  public readonly isEditMode = computed(() => this.ward() !== null);

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
