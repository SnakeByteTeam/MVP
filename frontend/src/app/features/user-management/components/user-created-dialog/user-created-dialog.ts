import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UserCreatedResponseDto } from '../../models/in/user-created-response.model.dto';
import { CreateUserDto } from '../../models/out/create-user.model.dto';

@Component({
  selector: 'app-user-created-dialog',
  imports: [],
  templateUrl: './user-created-dialog.html',
  styleUrl: './user-created-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreatedDialogComponent {
  response = input.required<UserCreatedResponseDto>(); //mostriamo solo quando non nullo con .required
  user = input.required<CreateUserDto>();
  closed = output<void>();

  closeDialog(): void {
    this.closed.emit();
  }

}
