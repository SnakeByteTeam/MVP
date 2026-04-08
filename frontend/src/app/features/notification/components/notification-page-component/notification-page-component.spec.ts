import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { NotificationEvent } from '../../models/notification-event.model';
import { NotificationListVm } from '../../models/notification-list-vm.model';
import { NotificationService } from '../../services/notification.service';
import { NotificationItemComponent } from '../notification-item-component/notification-item-component';

import { NotificationPageComponent } from './notification-page-component';

describe('NotificationPageComponent', () => {
  let component: NotificationPageComponent;
  let fixture: ComponentFixture<NotificationPageComponent>;
  let vmSubject: BehaviorSubject<NotificationListVm>;

  const notificationServiceStub = {
    vm$: undefined as unknown as BehaviorSubject<NotificationListVm>,
    removeNotification: vi.fn(),
    clearAllNotifications: vi.fn(),
  };

  const notificationA: NotificationEvent = {
    notificationId: 'n-1',
    title: 'Allarme antincendio attivo',
    sentAt: '2026-03-24T10:00:00.000Z',
  };

  const notificationB: NotificationEvent = {
    notificationId: 'n-2',
    title: 'Porta ingresso aperta',
    sentAt: '2026-03-24T10:05:00.000Z',
  };

  beforeEach(async () => {
    vmSubject = new BehaviorSubject<NotificationListVm>({
      notifications: [],
      unreadCount: 0,
    });
    notificationServiceStub.vm$ = vmSubject;

    await TestBed.configureTestingModule({
      imports: [NotificationPageComponent],
    })
      .overrideComponent(NotificationPageComponent, {
        set: {
          providers: [{ provide: NotificationService, useValue: notificationServiceStub }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(NotificationPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renderizza uno stato vuoto accessibile quando non ci sono notifiche', () => {
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('.notification-page__empty');
    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('Nessuna notifica disponibile');

    const items = fixture.debugElement.queryAll(By.directive(NotificationItemComponent));
    expect(items).toHaveLength(0);
  });

  it('renderizza la lista notifiche e passa i dati ai figli', () => {
    vmSubject.next({
      notifications: [notificationA, notificationB],
      unreadCount: 2,
    });
    fixture.detectChanges();

    const summary = fixture.nativeElement.querySelector('.notification-page__summary');
    expect(summary.textContent).toContain('2 notifiche non lette');

    const items = fixture.debugElement.queryAll(By.directive(NotificationItemComponent));
    expect(items).toHaveLength(2);
    expect(items[0].componentInstance.notification()).toEqual(notificationA);
    expect(items[1].componentInstance.notification()).toEqual(notificationB);
  });

  it('usa il singolare nel riepilogo quando unreadCount e 1', () => {
    vmSubject.next({
      notifications: [notificationA],
      unreadCount: 1,
    });
    fixture.detectChanges();

    const summary = fixture.nativeElement.querySelector('.notification-page__summary');
    expect(summary.textContent).toContain('1 notifica non letta');
  });

  it('aggiorna il DOM quando vm$ emette un nuovo snapshot coerente', () => {
    fixture.detectChanges();

    vmSubject.next({
      notifications: [notificationA],
      unreadCount: 1,
    });
    fixture.detectChanges();

    let items = fixture.debugElement.queryAll(By.directive(NotificationItemComponent));
    expect(items).toHaveLength(1);

    vmSubject.next({
      notifications: [notificationA, notificationB],
      unreadCount: 2,
    });
    fixture.detectChanges();

    items = fixture.debugElement.queryAll(By.directive(NotificationItemComponent));
    expect(items).toHaveLength(2);
  });

  it('invoca clearAllNotifications quando si clicca Cancella tutte', () => {
    vmSubject.next({
      notifications: [notificationA, notificationB],
      unreadCount: 2,
    });
    fixture.detectChanges();

    const clearAllButton = fixture.nativeElement.querySelector('button');
    clearAllButton.click();

    expect(notificationServiceStub.clearAllNotifications).toHaveBeenCalledWith([
      notificationA,
      notificationB,
    ]);
  });
});