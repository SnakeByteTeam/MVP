import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserCreatedDialogComponent } from './user-created-dialog';

describe('UserCreatedDialogComponent', () => {
  let component: UserCreatedDialogComponent;
  let fixture: ComponentFixture<UserCreatedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCreatedDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCreatedDialogComponent);
    fixture.componentRef.setInput('user', {
      name: 'Mario',
      surname: 'Rossi',
      username: 'mrossi',
    });
    fixture.componentRef.setInput('response', {
      tempPassword: 'TempPass123',
    });
    fixture.detectChanges();
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('mostra nome utente e password temporanea', () => {
    const textContent = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(textContent).toContain('Mario');
    expect(textContent).toContain('mrossi');
    expect(textContent).toContain('TempPass123');
  });

  it('closeDialog emette evento closed', () => {
    const closedSpy = vi.spyOn(component.closed, 'emit');

    component.closeDialog();

    expect(closedSpy).toHaveBeenCalledTimes(1);
  });

  it('click sul bottone chiudi invoca closeDialog', () => {
    const closeSpy = vi.spyOn(component, 'closeDialog');
    const button = fixture.debugElement.query(By.css('button'));

    button.triggerEventHandler('click', null);

    expect(closeSpy).toHaveBeenCalledTimes(1);
  });
});
