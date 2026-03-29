import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../../../core/models/user-role.enum';

import { UserListComponent } from './user-list';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('users', [
      {
        id: 1,
        firstName: 'Mario',
        lastName: 'Rossi',
        username: 'mrossi',
        role: UserRole.OPERATORE_SANITARIO,
      },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onDelete emette deleteUser con id numerico quando confermato', () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    const emitSpy = vi.spyOn(component.deleteUser, 'emit');
    const user = {
      id: 1,
      firstName: 'Mario',
      lastName: 'Rossi',
      username: 'mrossi',
      role: UserRole.OPERATORE_SANITARIO,
    };

    component.onDelete(user);

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(1);
    expect(emitSpy).toHaveBeenCalledTimes(1);
    confirmSpy.mockRestore();
  });

  it('onDelete non emette deleteUser quando non confermato', () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(false);
    const emitSpy = vi.spyOn(component.deleteUser, 'emit');
    const user = {
      id: 1,
      firstName: 'Mario',
      lastName: 'Rossi',
      username: 'mrossi',
      role: UserRole.OPERATORE_SANITARIO,
    };

    component.onDelete(user);

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});
