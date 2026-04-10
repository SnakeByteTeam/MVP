import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserListComponent } from '../user-list/user-list';
import { CreateUserFormComponent } from '../create-user-form/create-user-form.component';
import { UserCreatedDialogComponent } from '../user-created-dialog/user-created-dialog';
import { UserDto } from '../../models/in/user.model.dto';
import { CreateUserDto } from '../../models/out/create-user.model.dto';
import { UserManagementPageStateService } from '../../services/user-management-page-state.service';

@Component({
  selector: 'app-user-management-page',
  imports: [AsyncPipe, UserListComponent, CreateUserFormComponent, UserCreatedDialogComponent],
  providers: [UserManagementPageStateService],
  templateUrl: './user-management-page.html',
  styleUrl: './user-management-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementPageComponent {
  private readonly pageState = inject(UserManagementPageStateService);

  public readonly users$: Observable<UserDto[]> = this.pageState.users$;
  public readonly createdResponse = this.pageState.createdResponse;
  public readonly createdUser = this.pageState.createdUser;
  public readonly formError = this.pageState.formError;
  public readonly isCreateFormOpen = this.pageState.isCreateFormOpen;

  @ViewChild(CreateUserFormComponent)
  private readonly createUserFormComponent?: CreateUserFormComponent;

  public openCreateForm(): void {
    this.pageState.openCreateForm();
  }

  public closeCreateForm(): void {
    this.pageState.closeCreateForm();
  }

  public onFormSubmit(dto: CreateUserDto): void {
    this.pageState.submitUser(dto).subscribe({
      next: () => {
        this.createUserFormComponent?.resetAndFocus();
      },
    });
  }

  public onUserDeleted(id: number): void {
    this.pageState.deleteUser(id).subscribe();
  }

  public onDialogClosed(): void {
    this.pageState.closeDialog();
  }
}
