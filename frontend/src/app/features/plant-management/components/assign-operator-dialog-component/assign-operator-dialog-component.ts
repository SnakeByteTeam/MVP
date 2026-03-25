import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { UserApiService } from '../../../../core/services/user-api.service';
import type { User } from '../../../../core/models/user.model';
import type { AssignOperatorDto } from '../../models/plant-api.dto';
import type { Ward } from '../../models/ward.model';

@Component({
  selector: 'app-assign-operator-dialog-component',
  imports: [ReactiveFormsModule, AsyncPipe],
  templateUrl: './assign-operator-dialog-component.html',
  styleUrl: './assign-operator-dialog-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignOperatorDialogComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userApiService = inject(UserApiService);

  public readonly wardId = input<number>(0);
  public readonly availableWards = input<Ward[]>([]);
  public readonly submitted = output<AssignOperatorDto>();
  public readonly cancelled = output<void>();

  public operators$!: Observable<User[]>;

  public readonly form = this.formBuilder.group({
    userId: this.formBuilder.control<number | null>(null, { validators: [Validators.required] }),
  });

  public ngOnInit(): void {
    this.operators$ = this.userApiService.getUsers().pipe(map((users) => users));
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
}
