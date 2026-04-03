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
        name: 'Mario',
        surname: 'Rossi',
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

  it('onDelete apre il dialog di conferma', () => {
    const user = {
      id: 1,
      name: 'Mario',
      surname: 'Rossi',
      username: 'mrossi',
      role: UserRole.OPERATORE_SANITARIO,
    };

    component.onDelete(user);

    expect(component.pendingDeleteUser()).toEqual(user);
  });

  it('onDeleteConfirm emette deleteUser con id numerico', () => {
    const emitSpy = vi.spyOn(component.deleteUser, 'emit');
    const user = {
      id: 1,
      name: 'Mario',
      surname: 'Rossi',
      username: 'mrossi',
      role: UserRole.OPERATORE_SANITARIO,
    };

    component.onDeleteRequest(user);
    component.onDeleteConfirm();

    expect(emitSpy).toHaveBeenCalledWith(1);
    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(component.pendingDeleteUser()).toBeNull();
  });

  it('onDeleteCancel non emette deleteUser e chiude il dialog', () => {
    const emitSpy = vi.spyOn(component.deleteUser, 'emit');
    const user = {
      id: 1,
      name: 'Mario',
      surname: 'Rossi',
      username: 'mrossi',
      role: UserRole.OPERATORE_SANITARIO,
    };

    component.onDeleteRequest(user);
    component.onDeleteCancel();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.pendingDeleteUser()).toBeNull();
  });
});
