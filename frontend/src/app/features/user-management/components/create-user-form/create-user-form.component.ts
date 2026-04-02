import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, input, output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateUserDto } from '../../models/out/create-user.model.dto';
import { UserManagementErrorType } from '../../models/user-management-error-type.enum';

@Component({
  selector: 'app-create-user-form',
  imports: [ReactiveFormsModule],
  templateUrl: './create-user-form.html',
  styleUrls: ['./create-user-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUserFormComponent {
  errorType = input<UserManagementErrorType | null>(null);
  formSubmit = output<CreateUserDto>();

  @ViewChild('nameInput')
  private readonly nameInput?: ElementRef<HTMLInputElement>;

  private readonly fb = inject(FormBuilder);
  public readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    surname: ['', [Validators.required, Validators.minLength(2)]],
    username: ['', [Validators.required, Validators.minLength(4)]],
  });

  public submit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.getRawValue());
    } else {
      this.form.markAllAsTouched();
    }
  }

  public reset(): void {
    this.form.reset({
      name: '',
      surname: '',
      username: '',
    });
  }

  public resetAndFocus(): void {
    this.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();

    queueMicrotask(() => {
      this.nameInput?.nativeElement.focus();
    });
  }
}