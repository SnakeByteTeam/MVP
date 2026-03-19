import { Component, input, output } from '@angular/core';
import { UserDto } from '../../models/in/user.model.dto';

@Component({
  selector: 'app-user-list',
  imports: [],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
  standalone: true
})

export class UserListComponent {
  users = input<UserDto[]>();
  deleteUser = output<string>();

  onDelete(user: UserDto): void {
    const isConfirmed = window.confirm(
      `Sei sicuro di voler eliminare l'operatore ${user.firstName} ${user.lastName}?`
    );

    // Se l'amministratore conferma, emettiamo l'evento verso il componente Smart
    if (isConfirmed) {
      this.deleteUser.emit(user.id); //passo id
    }
  }
}
