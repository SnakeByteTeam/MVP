import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlarmStateService } from 'src/app/core/alarm/services/alarm-state.service';
import { AlarmManagementRefreshService } from 'src/app/core/alarm/services/alarm-management-refresh.service';
import { UserRole } from 'src/app/core/models/user-role.enum';
import { InternalAuthService } from 'src/app/core/services/internal-auth.service';
import { VIMAR_CLOUD_API_SERVICE } from 'src/app/core/services/vimar-cloud-api.service.interface';
import { MainLayoutComponent } from 'src/app/features/main-layout/main-layout.component';
import { NavService } from 'src/app/features/main-layout/services/nav.service';
import { NotificationEvent } from 'src/app/features/notification/models/notification-event.model';

@Component({ template: '', standalone: true })
class DummyRouteComponent {}

describe('MainLayout feature integration', () => {
    let fixture: ComponentFixture<MainLayoutComponent>;
    let component: MainLayoutComponent;
    let notificationsSubject: BehaviorSubject<NotificationEvent[]>;

    const authServiceStub = {
        getCurrentUser$: vi.fn(),
        logoutFromBackend: vi.fn().mockReturnValue(of(void 0)),
    };

    const navServiceStub = {
        getNavItems: vi.fn().mockReturnValue([{ label: 'Dashboard', route: '/dashboard' }]),
    };

    const alarmStateStub = {
        getActiveAlarmsCount$: vi.fn().mockReturnValue(of(0)),
        getUnreadNotificationsCount$: vi.fn().mockReturnValue(of(0)),
        getNotifications$: vi.fn(),
        removeNotification: vi.fn(),
        clearNotifications: vi.fn(),
    };

    const vimarServiceStub = {
        getLinkedAccount: vi.fn().mockReturnValue(of({ email: '', isLinked: false })),
    };

    const alarmRefreshStub = {
        requestRefresh: vi.fn(),
        getRefreshRequested$: vi.fn(),
    };

    beforeEach(async () => {
        vi.clearAllMocks();
        notificationsSubject = new BehaviorSubject<NotificationEvent[]>([]);

        authServiceStub.getCurrentUser$.mockReturnValue(
            of({
                userId: '1',
                username: 'admin',
                role: UserRole.AMMINISTRATORE,
                accessToken: 'token',
                isFirstAccess: false,
            }),
        );
        alarmStateStub.getNotifications$.mockReturnValue(notificationsSubject.asObservable());

        await TestBed.configureTestingModule({
            imports: [MainLayoutComponent],
            providers: [
                { provide: InternalAuthService, useValue: authServiceStub },
                { provide: NavService, useValue: navServiceStub },
                { provide: AlarmStateService, useValue: alarmStateStub },
                { provide: VIMAR_CLOUD_API_SERVICE, useValue: vimarServiceStub },
                { provide: AlarmManagementRefreshService, useValue: alarmRefreshStub },
                provideRouter([
                    { path: 'auth/login', component: DummyRouteComponent },
                    { path: 'notifications', component: DummyRouteComponent },
                    { path: 'vimar-link', component: DummyRouteComponent },
                ]),
            ],
        }).compileComponents();
    });

    function createComponent(): void {
        fixture = TestBed.createComponent(MainLayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    it('TBD-RF carica menu da ruolo utente e stato topbar admin', () => {
        createComponent();

        expect(navServiceStub.getNavItems).toHaveBeenCalledWith(UserRole.AMMINISTRATORE);
        expect(component.navItems.length).toBeGreaterThan(0);
        expect(component.showVimarAssociationWarning).toBe(true);
    });

    it('TBD-RF senza sessione reindirizza al login', () => {
        authServiceStub.getCurrentUser$.mockReturnValue(of(null));
        const router = TestBed.inject(Router);
        const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

        createComponent();

        expect(component.navItems).toEqual([]);
        expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });

    it('TBD-RF nuova notifica realtime apre il pannello notifiche', () => {
        createComponent();
        expect(component.isNotificationPanelOpen).toBe(false);

        notificationsSubject.next([
            {
                notificationId: 'rt-1',
                title: 'Allarme realtime',
                sentAt: '2026-04-11T10:00:00.000Z',
                eventType: 'triggered',
            },
        ]);

        expect(component.isNotificationPanelOpen).toBe(true);
    });
});
