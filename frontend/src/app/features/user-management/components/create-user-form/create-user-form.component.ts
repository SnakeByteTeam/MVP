import { Component, input, output, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { CreateUserDto } from '../../models/out/create-user.model.dto';
import { UserManagementErrorType } from '../../models/user-management-error-type.enum';


//si potrebbe usare per tipizzare FormGroup<>
// interface CreateUserForm {
//   firstName: FormControl<string>;
//   lastName: FormControl<string>;
//   username: FormControl<string>;
// }

@Component({
  selector: 'app-create-user-form',
  standalone: true, // 2. Componente Standalone
  imports: [ReactiveFormsModule], // Importiamo direttamente i form reattivi
  templateUrl: './create-user-form.html',
  styleUrls: ['./create-user-form.css']
})

export class CreateUserFormComponent implements OnInit {
  errorType = input<UserManagementErrorType | null>(null);
  formSubmit = output<CreateUserDto>();

  private readonly fb = inject(FormBuilder);
  public form!: FormGroup;


  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.getRawValue());
    } else {
      this.form.markAllAsTouched();
    }
  }

  reset(): void {
    this.form.reset();
  }
}