import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationEvent } from 'src/app/features/notification/models/notification-event.model';
import { NotificationListVm } from 'src/app/features/notification/models/notification-list-vm.model';
import { NotificationItemComponent } from 'src/app/features/notification/components/notification-item-component/notification-item-component';
import { NotificationPageComponent } from 'src/app/features/notification/components/notification-page-component/notification-page-component';
import { NotificationService } from 'src/app/features/notification/services/notification.service';

describe('Notification feature integration', () => {
    let fixture: ComponentFixture<NotificationPageComponent>;
    let component: NotificationPageComponent;
    let vmSubject: BehaviorSubject<NotificationListVm>;
    let queryParamMapSubject: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

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
        queryParamMapSubject = new BehaviorSubject(convertToParamMap({}));

        await TestBed.configureTestingModule({
            imports: [NotificationPageComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParamMap: queryParamMapSubject.asObservable(),
                    },
                },
            ],
        })
            .overrideComponent(NotificationPageComponent, {
                set: {
                    providers: [{ provide: NotificationService, useValue: notificationServiceStub }],
                },
            })
            .compileComponents();

        fixture = TestBed.createComponent(NotificationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('TBD-RF visualizza stato vuoto quando non ci sono notifiche', () => {
        expect(component).toBeTruthy();
        const emptyState = fixture.nativeElement.querySelector('.notification-page__empty');
        expect(emptyState).toBeTruthy();
        expect(emptyState.textContent).toContain('Nessuna notifica disponibile');
    });

    it('TBD-RF renderizza lista notifiche e clear-all sul servizio', () => {
        vmSubject.next({
            notifications: [notificationA, notificationB],
            unreadCount: 2,
        });
        fixture.detectChanges();

        const items = fixture.debugElement.queryAll(By.directive(NotificationItemComponent));
        expect(items).toHaveLength(2);

        const clearAllButton = fixture.nativeElement.querySelector('button');
        clearAllButton.click();

        expect(notificationServiceStub.clearAllNotifications).toHaveBeenCalledWith([notificationA, notificationB]);
    });

    it('TBD-RF focus query param evidenzia la notifica corretta', () => {
        queryParamMapSubject.next(convertToParamMap({ focus: 'n-2' }));
        vmSubject.next({
            notifications: [notificationA, notificationB],
            unreadCount: 2,
        });
        fixture.detectChanges();

        const items = fixture.debugElement.queryAll(By.directive(NotificationItemComponent));
        expect(items[0].componentInstance.isHighlighted()).toBe(false);
        expect(items[1].componentInstance.isHighlighted()).toBe(true);
    });
});
