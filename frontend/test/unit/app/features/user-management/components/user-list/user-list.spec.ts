import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from 'src/app/core/models/user-role.enum';

import { UserListComponent } from 'src/app/features/user-management/components/user-list/user-list';

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

  it('renderizza la lista utenti nel template', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('mrossi');
    expect(fixture.nativeElement.textContent).toContain('Mario');
    expect(fixture.nativeElement.textContent).toContain('Rossi');
  });

  it('mostra il contatore utenti nell header', () => {
    expect(fixture.nativeElement.textContent).toContain('1 utenti');
  });

  it('mostra stato vuoto quando users e vuoto', () => {
    fixture.componentRef.setInput('users', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nessun operatore sanitario presente');
    expect(fixture.nativeElement.textContent).toContain('0 utenti');
  });

  it('cliccando Elimina apre il dialog di conferma nel template', () => {
    const deleteBtn = fixture.nativeElement.querySelector('button');
    deleteBtn.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('dialog')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Conferma eliminazione');
    expect(fixture.nativeElement.textContent).toContain('@mrossi');
  });

  it('cliccando Annulla nel dialog chiude senza emettere', () => {
    const emitSpy = vi.spyOn(component.deleteUser, 'emit');
    const deleteBtn = fixture.nativeElement.querySelector('button');
    deleteBtn.click();
    fixture.detectChanges();

    const cancelBtn = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (b: any) => b.textContent?.trim() === 'Annulla'
    ) as HTMLButtonElement;
    cancelBtn.click();
    fixture.detectChanges();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('dialog')).toBeNull();
  });

  it('cliccando Elimina operatore nel dialog conferma ed emette', () => {
    const emitSpy = vi.spyOn(component.deleteUser, 'emit');
    const deleteBtn = fixture.nativeElement.querySelector('button');
    deleteBtn.click();
    fixture.detectChanges();

    const confirmBtn = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (b: any) => b.textContent?.trim() === 'Elimina operatore'
    ) as HTMLButtonElement;
    confirmBtn.click();
    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalledWith(1);
    expect(fixture.nativeElement.querySelector('dialog')).toBeNull();
  });

  it('onDeleteConfirm non fa nulla se pendingDeleteUser e null', () => {
    const emitSpy = vi.spyOn(component.deleteUser, 'emit');
    component.onDeleteConfirm();
    expect(emitSpy).not.toHaveBeenCalled();
  });
});
