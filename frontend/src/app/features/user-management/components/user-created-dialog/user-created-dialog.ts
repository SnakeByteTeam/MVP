import { Component, input, output } from '@angular/core';
import { UserCreatedResponseDto } from '../../models/in/user-created-response.model.dto';

@Component({
  selector: 'app-user-created-dialog',
  imports: [],
  templateUrl: './user-created-dialog.html',
  styleUrl: './user-created-dialog.css',
  standalone: true
})
export class UserCreatedDialogComponent {
  response = input.required<UserCreatedResponseDto>(); //mostriamo solo quando non nullo con .required
  closed = output<void>();

  closeDialog(): void {
    this.closed.emit();
  }
}
