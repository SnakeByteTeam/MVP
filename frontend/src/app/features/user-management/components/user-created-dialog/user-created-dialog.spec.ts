import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCreatedDialog } from './user-created-dialog';

describe('UserCreatedDialog', () => {
  let component: UserCreatedDialog;
  let fixture: ComponentFixture<UserCreatedDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCreatedDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCreatedDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
