import { ChangeDetectionStrategy, Component, signal, input, output } from '@angular/core';
import { UserDto } from '../../models/in/user.model.dto';

@Component({
  selector: 'app-user-list',
  imports: [],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class UserListComponent {
  users = input<UserDto[]>();
  deleteUser = output<number>();

  public readonly pendingDeleteUser = signal<UserDto | null>(null);

  onDeleteRequest(user: UserDto): void {
    this.pendingDeleteUser.set(user);
  }

  onDeleteCancel(): void {
    this.pendingDeleteUser.set(null);
  }

  onDeleteConfirm(): void {
    const user = this.pendingDeleteUser();
    if (!user) {
      return;
    }

    this.deleteUser.emit(user.id);
    this.pendingDeleteUser.set(null);
  }

  onDelete(user: UserDto): void {
    this.onDeleteRequest(user);
  }
}
