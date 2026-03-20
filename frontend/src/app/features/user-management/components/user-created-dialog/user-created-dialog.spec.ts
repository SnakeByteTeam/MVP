import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCreatedDialogComponent } from './user-created-dialog';

describe('UserCreatedDialogComponent', () => {
  let component: UserCreatedDialogComponent;
  let fixture: ComponentFixture<UserCreatedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCreatedDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCreatedDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
