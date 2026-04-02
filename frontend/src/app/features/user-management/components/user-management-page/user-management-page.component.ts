import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { UserListComponent } from '../user-list/user-list';
import { CreateUserFormComponent } from '../create-user-form/create-user-form.component';
import { UserCreatedDialogComponent } from '../user-created-dialog/user-created-dialog';
import { UserApiService } from '../../../../core/services/user-api.service';
import { BehaviorSubject, catchError, Observable, of, switchMap } from 'rxjs';
import { UserDto } from '../../models/in/user.model.dto';
import { UserCreatedResponseDto } from '../../models/in/user-created-response.model.dto';
import { UserManagementErrorType } from '../../models/user-management-error-type.enum';
import { CreateUserDto } from '../../models/out/create-user.model.dto';

@Component({
  selector: 'app-user-management-page',
  imports: [AsyncPipe, UserListComponent, CreateUserFormComponent, UserCreatedDialogComponent],
  templateUrl: './user-management-page.html',
  styleUrl: './user-management-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementPageComponent implements OnInit {

  private readonly userApi = inject(UserApiService);
  //stato reattivo: si emette un valore qui dentro ogni volta che vogliamo refreshare la lista
  private readonly refreshTrigger$ = new BehaviorSubject<void>(undefined);

  public users$!: Observable<UserDto[]>;
  public createdResponse = signal<UserCreatedResponseDto | null>(null);
  public createdUser = signal<CreateUserDto | null>(null);
  public formError = signal<UserManagementErrorType | null>(null);

  @ViewChild(CreateUserFormComponent)
  private readonly createUserFormComponent?: CreateUserFormComponent;



  // Ogni volta che refreshTrigger$ emette, switchMap annulla la chiamata HTTP precedente (se in corso)
  // e ne fa partire una nuova, restituendo la lista aggiornata.
  ngOnInit(): void {
    this.users$ = this.refreshTrigger$.pipe(
      switchMap(() => this.userApi.getUsers()),
      catchError(err => {
        console.error('Errore durante il caricamento degli utenti:', err);
        return of([]);
      })
    )
  }


  //Quando il form emette un CreateUserDto valido (UC7, UC46)
  onFormSubmit(dto: CreateUserDto): void {

    this.formError.set(null);

    //chiama il service
    this.userApi.createUser(dto).subscribe({
      next: (response: UserCreatedResponseDto) => {
        //Successo
        //mostra dialog e aggiorna la lista
        this.createdResponse.set(response);
        this.createdUser.set(dto);
        this.refreshTrigger$.next(); // ricarica la lista
        this.formError.set(null);
        this.createUserFormComponent?.resetAndFocus();
      },
      error: (err) => {
        if (err.status === 409) {
          this.formError.set(UserManagementErrorType.USERNAME_ALREADY_IN_USE);
        } else {
          this.formError.set(UserManagementErrorType.OTHER_ERROR);
        }
      }
    });
  }


  onUserDeleted(id: number): void {
    this.userApi.deleteUser(id).subscribe({
      next: () => {
        //successo: trigger emette, lista si aggiorna
        this.refreshTrigger$.next();
      },
      error: (err) => {
        console.error("Errore durante l'eliminazione:", err);
      }
    });
  }


  //quando l'amministratore chiude il dialog della creazione utente avvenuta con display tempPassword
  onDialogClosed(): void {
    this.createdResponse.set(null);
    this.createdUser.set(null);
  }


}
