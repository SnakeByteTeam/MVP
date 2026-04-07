import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NotificationTopbarPanelComponent } from './notification-topbar-panel-component';

describe('NotificationTopbarPanelComponent', () => {
  let fixture: ComponentFixture<NotificationTopbarPanelComponent>;
  let component: NotificationTopbarPanelComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationTopbarPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationTopbarPanelComponent);
    component = fixture.componentInstance;
  });

  it('mostra stato vuoto quando non ci sono notifiche', () => {
    component.notifications = [];
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('.notification-topbar-panel__empty') as HTMLElement;
    expect(empty).toBeTruthy();
    expect(empty.textContent?.toLowerCase()).toContain('nessuna notifica');
  });

  it('emette viewAllClicked quando si clicca su Vedi tutte', () => {
    const emitSpy = vi.spyOn(component.viewAllClicked, 'emit');

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.notification-topbar-panel__header button') as HTMLButtonElement;
    button.click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });
});
