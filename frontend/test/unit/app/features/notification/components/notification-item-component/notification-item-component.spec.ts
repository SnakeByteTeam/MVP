import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationEvent } from 'src/app/features/notification/models/notification-event.model';

import { NotificationItemComponent } from 'src/app/features/notification/components/notification-item-component/notification-item-component';

describe('NotificationItemComponent', () => {
  let component: NotificationItemComponent;
  let fixture: ComponentFixture<NotificationItemComponent>;

  const notification: NotificationEvent = {
    notificationId: 'n-1',
    title: 'Rilevato movimento in soggiorno',
    sentAt: '2026-03-24T11:58:48.000Z',
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-24T12:00:00.000Z'));

    await TestBed.configureTestingModule({
      imports: [NotificationItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationItemComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    fixture.componentRef.setInput('notification', notification);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renderizza titolo e tempo relativo', () => {
    fixture.componentRef.setInput('notification', notification);
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.notification-item__title');
    const time = fixture.nativeElement.querySelector('.notification-item__time');

    expect(title.textContent).toContain('Rilevato movimento in soggiorno');
    expect(time.textContent.trim()).toBe('1m fa');
  });

  it('espone il timestamp originale in datetime per accessibilita e machine-readability', () => {
    fixture.componentRef.setInput('notification', notification);
    fixture.detectChanges();

    const time = fixture.nativeElement.querySelector('time');
    expect(time.getAttribute('datetime')).toBe(notification.sentAt);
  });

  it('aggiorna il contenuto quando cambia input notification', () => {
    fixture.componentRef.setInput('notification', notification);
    fixture.detectChanges();

    const updatedNotification: NotificationEvent = {
      notificationId: 'n-2',
      title: 'Temperatura elevata in cucina',
      sentAt: '2026-03-24T11:59:20.000Z',
    };

    fixture.componentRef.setInput('notification', updatedNotification);
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.notification-item__title');
    const time = fixture.nativeElement.querySelector('.notification-item__time');

    expect(title.textContent).toContain('Temperatura elevata in cucina');
    expect(time.textContent.trim()).toBe('40s fa');
  });

  it('emette removeClicked quando si clicca la X', () => {
    const emitSpy = vi.spyOn(component.removeClicked, 'emit');

    fixture.componentRef.setInput('notification', notification);
    fixture.componentRef.setInput('showRemoveAction', true);
    fixture.detectChanges();

    const removeButton = fixture.nativeElement.querySelector('.notification-item__remove') as HTMLButtonElement;
    removeButton.click();

    expect(emitSpy).toHaveBeenCalledWith('n-1');
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });
});