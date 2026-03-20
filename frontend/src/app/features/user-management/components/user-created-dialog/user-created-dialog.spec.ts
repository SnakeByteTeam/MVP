import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCreatedDialogComponent } from './user-created-dialog';
import { UserRole } from '../../../../core/models/user-role.enum';

describe('UserCreatedDialogComponent', () => {
  let component: UserCreatedDialogComponent;
  let fixture: ComponentFixture<UserCreatedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCreatedDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCreatedDialogComponent);
    fixture.componentRef.setInput('response', {
      user: {
        id: 'user-1',
        firstName: 'Mario',
        lastName: 'Rossi',
        username: 'mrossi',
        role: UserRole.OPERATORE_SANITARIO,
      },
      temporaryPassword: 'TempPass123',
    });
    fixture.detectChanges();
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
