import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationTopbarPanelComponent } from 'src/app/features/notification/components/notification-topbar-panel-component/notification-topbar-panel-component';
import type { NotificationEvent } from 'src/app/features/notification/models/notification-event.model';

describe('NotificationTopbarPanel feature integration', () => {
    let fixture: ComponentFixture<NotificationTopbarPanelComponent>;
    let component: NotificationTopbarPanelComponent;

    const notifications: NotificationEvent[] = [
        { notificationId: 'n-1', title: '! Allarme antincendio', sentAt: '2026-04-11T10:00:00.000Z' },
        { notificationId: 'n-2', title: '• Porta aperta', sentAt: '2026-04-11T10:01:00.000Z' },
        { notificationId: 'n-3', title: 'i Batteria bassa', sentAt: '2026-04-11T10:02:00.000Z' },
        { notificationId: 'n-4', title: '▲ Caduta rilevata', sentAt: '2026-04-11T10:03:00.000Z' },
        { notificationId: 'n-5', title: 'Notifica 5', sentAt: '2026-04-11T10:04:00.000Z' },
        { notificationId: 'n-6', title: 'Notifica 6', sentAt: '2026-04-11T10:05:00.000Z' },
        { notificationId: 'n-7', title: 'Notifica 7', sentAt: '2026-04-11T10:06:00.000Z' },
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NotificationTopbarPanelComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(NotificationTopbarPanelComponent);
        component = fixture.componentInstance;
    });

    it('RF105-OPL stato vuoto mostra messaggio e nasconde clear-all', () => {
        component.notifications = [];
        fixture.detectChanges();

        const empty = fixture.nativeElement.querySelector('.notification-topbar-panel__empty');
        const clearAll = fixture.nativeElement.querySelector('.notification-topbar-panel__clear-all');

        expect(empty?.textContent).toContain('Nessuna notifica disponibile');
        expect(clearAll).toBeNull();
    });

    it('RF103-OPL mostra max 6 notifiche e clear-all emette evento', () => {
        const clearSpy = vi.fn();
        component.clearAllClicked.subscribe(clearSpy);
        component.notifications = notifications;
        fixture.detectChanges();

        const items = fixture.nativeElement.querySelectorAll('.notification-topbar-panel__item');
        const clearAllButton = fixture.nativeElement.querySelector('.notification-topbar-panel__clear-all');

        expect(items.length).toBe(6);
        clearAllButton?.dispatchEvent(new MouseEvent('click'));

        expect(clearSpy).toHaveBeenCalledTimes(1);
    });

    it('RF104-OPL click su notifica e remove emettono gli id corretti', () => {
        const selectedSpy = vi.fn();
        const removeSpy = vi.fn();
        component.notificationSelected.subscribe(selectedSpy);
        component.removeClicked.subscribe(removeSpy);
        component.notifications = notifications;
        fixture.detectChanges();

        const openButtons = fixture.nativeElement.querySelectorAll('.notification-topbar-panel__open');
        const removeButtons = fixture.nativeElement.querySelectorAll('.notification-topbar-panel__remove');

        openButtons[1].dispatchEvent(new MouseEvent('click'));
        removeButtons[1].dispatchEvent(new MouseEvent('click'));

        expect(selectedSpy).toHaveBeenCalledWith('n-2');
        expect(removeSpy).toHaveBeenCalledWith('n-2');
    });

    it('RF102-OPL applica parsing priorita e titolo visualizzato', () => {
        component.notifications = notifications;
        fixture.detectChanges();

        expect(component.getPriority(notifications[0])).not.toBeNull();
        expect(component.getDisplayTitle(notifications[0])).toBe('Allarme antincendio');
        expect(component.getPrioritySymbol(component.getPriority(notifications[0])!)).toBe('!');
    });
});
