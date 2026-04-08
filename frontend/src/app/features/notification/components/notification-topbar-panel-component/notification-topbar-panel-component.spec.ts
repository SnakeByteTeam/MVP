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

    const button = fixture.nativeElement.querySelector('.notification-topbar-panel__view-all') as HTMLButtonElement;
    button.click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('emette removeClicked quando si clicca sulla X di una notifica', () => {
    const removeSpy = vi.spyOn(component.removeClicked, 'emit');
    component.notifications = [
      {
        notificationId: 'n-1',
        title: 'Notifica test',
        sentAt: '2026-04-07T12:00:00.000Z',
      },
    ];
    fixture.detectChanges();

    const removeButton = fixture.nativeElement.querySelector('.notification-topbar-panel__remove') as HTMLButtonElement;
    removeButton.click();

    expect(removeSpy).toHaveBeenCalledWith('n-1');
    expect(removeSpy).toHaveBeenCalledTimes(1);
  });

  it('emette notificationSelected quando si clicca su un item notifica in preview', () => {
    const selectedSpy = vi.spyOn(component.notificationSelected, 'emit');
    component.notifications = [
      {
        notificationId: 'n-1',
        title: 'Notifica test',
        sentAt: '2026-04-07T12:00:00.000Z',
      },
    ];
    fixture.detectChanges();

    const openButton = fixture.nativeElement.querySelector('.notification-topbar-panel__open') as HTMLButtonElement;
    openButton.click();

    expect(selectedSpy).toHaveBeenCalledWith('n-1');
    expect(selectedSpy).toHaveBeenCalledTimes(1);
  });

  it('emette clearAllClicked quando si clicca Cancella tutte', () => {
    const clearAllSpy = vi.spyOn(component.clearAllClicked, 'emit');
    component.notifications = [
      {
        notificationId: 'n-1',
        title: 'Notifica test',
        sentAt: '2026-04-07T12:00:00.000Z',
      },
    ];
    fixture.detectChanges();

    const clearAllButton = fixture.nativeElement.querySelector('.notification-topbar-panel__clear-all') as HTMLButtonElement;
    clearAllButton.click();

    expect(clearAllSpy).toHaveBeenCalledTimes(1);
  });
});
