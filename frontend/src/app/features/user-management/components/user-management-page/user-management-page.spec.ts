import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { UserManagementPageComponent } from './user-management-page.component';
import { API_BASE_URL } from '../../../../core/tokens/api-base-url.token';
import { UserApiService } from '../../../../core/services/user-api.service';
import { UserRole } from '../../../../core/models/user-role.enum';

describe('UserManagementPage', () => {
  let component: UserManagementPageComponent;
  let fixture: ComponentFixture<UserManagementPageComponent>;

  const userApiServiceMock = {
    getUsers: () => of([]),
    createUser: () =>
      of({
        user: {
          id: 'user-1',
          firstName: 'Mario',
          lastName: 'Rossi',
          username: 'mrossi',
          role: UserRole.OPERATORE_SANITARIO,
        },
        temporaryPassword: 'TempPass123',
      }),
    deleteUser: () => of(undefined),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagementPageComponent],
      providers: [
        { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
        { provide: UserApiService, useValue: userApiServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
