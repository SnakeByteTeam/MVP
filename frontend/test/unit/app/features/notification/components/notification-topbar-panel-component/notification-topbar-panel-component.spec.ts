import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NotificationTopbarPanelComponent } from 'src/app/features/notification/components/notification-topbar-panel-component/notification-topbar-panel-component';
import { AlarmPriority } from 'src/app/core/alarm/models/alarm-priority.enum';

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

  it('mostra al massimo 6 notifiche nella preview', () => {
    component.notifications = Array.from({ length: 8 }, (_, i) => ({
      notificationId: `n-${i + 1}`,
      title: `Notifica ${i + 1}`,
      sentAt: '2026-04-07T12:00:00.000Z',
    }));

    fixture.detectChanges();

    const previewItems = fixture.nativeElement.querySelectorAll('.notification-topbar-panel__item');
    expect(previewItems.length).toBe(6);
    expect(component.visibleNotifications).toHaveLength(6);
  });

  it('onRemove ferma la propagazione e notifica la rimozione', () => {
    const removeSpy = vi.spyOn(component.removeClicked, 'emit');
    const stopPropagation = vi.fn();

    component.onRemove('n-88', { stopPropagation } as unknown as Event);

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledWith('n-88');
  });

  it('calcola priorita e titolo visualizzato in base al prefisso', () => {
    const orangeNotification = {
      notificationId: 'n-priority',
      title: '! Sensore offline',
      sentAt: '2026-04-07T12:00:00.000Z',
    };
    const plainNotification = {
      notificationId: 'n-plain',
      title: 'Messaggio senza priorita',
      sentAt: '2026-04-07T12:00:00.000Z',
    };

    expect(component.getPriority(orangeNotification)).toBe(AlarmPriority.ORANGE);
    expect(component.getDisplayTitle(orangeNotification)).toBe('Sensore offline');

    expect(component.getPriority(plainNotification)).toBeNull();
    expect(component.getDisplayTitle(plainNotification)).toBe('Messaggio senza priorita');
  });

  it('restituisce simboli e classi corretti per tutte le priorita e fallback', () => {
    expect(component.getPrioritySymbol(AlarmPriority.WHITE)).toBe('i');
    expect(component.getPrioritySymbol(AlarmPriority.GREEN)).toBe('•');
    expect(component.getPrioritySymbol(AlarmPriority.ORANGE)).toBe('!');
    expect(component.getPrioritySymbol(AlarmPriority.RED)).toBe('▲');
    expect(component.getPrioritySymbol(999 as AlarmPriority)).toBe('');

    expect(component.getPriorityBubbleClass(AlarmPriority.WHITE)).toContain('slate');
    expect(component.getPriorityBubbleClass(AlarmPriority.GREEN)).toContain('emerald');
    expect(component.getPriorityBubbleClass(AlarmPriority.ORANGE)).toContain('amber');
    expect(component.getPriorityBubbleClass(AlarmPriority.RED)).toContain('rose');
    expect(component.getPriorityBubbleClass(999 as AlarmPriority)).toContain('slate');

    expect(component.getPrioritySymbolClass(AlarmPriority.WHITE)).toBe('text-slate-600');
    expect(component.getPrioritySymbolClass(AlarmPriority.GREEN)).toBe('text-emerald-600');
    expect(component.getPrioritySymbolClass(AlarmPriority.ORANGE)).toBe('text-amber-600');
    expect(component.getPrioritySymbolClass(AlarmPriority.RED)).toBe('text-rose-600');
    expect(component.getPrioritySymbolClass(999 as AlarmPriority)).toBe('text-slate-600');
  });
});
