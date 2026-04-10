import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { User } from '../../../user-management/models/user.model';
import type { AssignOperatorDto } from '../../models/ward-api.dto';
import type { Ward } from '../../models/ward.model';

@Component({
  selector: 'app-assign-operator-dialog-component',
  imports: [ReactiveFormsModule],
  templateUrl: './assign-operator-dialog-component.html',
  styleUrl: './assign-operator-dialog-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignOperatorDialogComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  public readonly wardId = input<number>(0);
  public readonly availableWards = input<Ward[]>([]);
  public readonly availableOperators = input<User[]>([]);
  public readonly submitted = output<AssignOperatorDto>();
  public readonly cancelled = output<void>();

  public readonly form = this.formBuilder.group({
    userId: this.formBuilder.control<number | null>(null, { validators: [Validators.required] }),
  });

  public ngOnInit(): void {
    this.form.reset({ userId: null });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit({ userId: this.form.controls.userId.value as number });
  }

  public onCancel(): void {
    this.cancelled.emit();
  }

  public getOperatorLabel(operator: User): string {
    const fullName = `${operator.firstName} ${operator.lastName}`.trim();
    return fullName || operator.username;
  }
}
