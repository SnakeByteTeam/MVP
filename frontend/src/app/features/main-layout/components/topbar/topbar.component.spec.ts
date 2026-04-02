import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopbarComponent } from './topbar.component';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { UserRole } from '../../../../core/models/user-role.enum';

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;

  const mockUser = {
    username: 'mario@test.it',
    firstName: 'Mario',
    lastName: 'Rossi',
    role: UserRole.AMMINISTRATORE
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopbarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
    
    component.user = mockUser;
    
    fixture.detectChanges();
  });

  it('dovrebbe essere creato', () => {
    expect(component).toBeTruthy();
  });

  it('dovrebbe emettere logoutClicked quando viene premuto il tasto logout', () => {
    const spy = vi.spyOn(component.logoutClicked, 'emit');

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const logoutButton = Array.from(buttons).find(
      (btn: any) => btn.textContent.toLowerCase().trim() === 'logout'
    ) as HTMLButtonElement;

    logoutButton.click();

    expect(spy).toHaveBeenCalled();
  });

  it('dovrebbe emettere profileClicked quando viene premuto il nome utente', () => {
    const spy = vi.spyOn(component.profileClicked, 'emit');

    const profileButton = fixture.nativeElement.querySelector('button[aria-label="Apri profilo"]') as HTMLButtonElement;
    profileButton.click();

    expect(spy).toHaveBeenCalled();
  });
});