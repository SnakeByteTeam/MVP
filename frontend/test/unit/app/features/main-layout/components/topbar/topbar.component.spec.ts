import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopbarComponent } from 'src/app/features/main-layout/components/topbar/topbar.component';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { UserRole } from 'src/app/core/models/user-role.enum';
import { BreadcrumbService } from 'src/app/core/services/breadcrumb.service';
import { of } from 'rxjs';

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
      imports: [TopbarComponent],
      providers: [
        {
          provide: BreadcrumbService,
          useValue: {
            breadcrumbs$: of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
    
    component.user = mockUser;
    
    fixture.detectChanges();
  });

  it('dovrebbe essere creato', () => {
    expect(component).toBeTruthy();
  });

  it('dovrebbe emettere hamburgerClicked quando viene premuto il menu', () => {
    const spy = vi.spyOn(component.hamburgerClicked, 'emit');

    const menuButton = fixture.nativeElement.querySelector('button[aria-label="Apri menu"]') as HTMLButtonElement;
    menuButton.click();

    expect(spy).toHaveBeenCalled();
  });

  it('dovrebbe emettere profileClicked quando viene premuto il nome utente', () => {
    const spy = vi.spyOn(component.profileClicked, 'emit');

    const profileButton = fixture.nativeElement.querySelector('button[aria-label="Apri profilo"]') as HTMLButtonElement;
    profileButton.click();

    expect(spy).toHaveBeenCalled();
  });

  it('emette profileClicked anche quando utente non admin', () => {
    const spy = vi.spyOn(component.profileClicked, 'emit');
    fixture.componentRef.setInput('user', {
      ...mockUser,
      role: UserRole.OPERATORE_SANITARIO,
    });
    fixture.detectChanges();

    const profileButton = fixture.nativeElement.querySelector('button[aria-label="Apri profilo"]') as HTMLButtonElement;
    profileButton.click();

    expect(spy).toHaveBeenCalled();
  });

  it('evidenzia in giallo il profilo quando attivo', () => {
    fixture.componentRef.setInput('isProfileActive', true);
    fixture.detectChanges();

    const profileButton = fixture.nativeElement.querySelector('button[aria-label="Apri profilo"]') as HTMLButtonElement;
    expect(profileButton.classList.contains('bg-amber-300')).toBe(true);
  });

  it('mostra avviso MyVimar quando richiesto', () => {
    fixture.componentRef.setInput('showVimarWarning', true);
    fixture.detectChanges();

    const warning = fixture.nativeElement.querySelector('.topbar-vimar-warning') as HTMLElement;
    expect(warning).toBeTruthy();
    expect(warning.textContent?.toLowerCase()).toContain('account da associare a myvimar');
  });
});