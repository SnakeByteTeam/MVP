import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { MainLayoutComponent } from './main-layout.component';
import { InternalAuthService } from '../../core/services/internal-auth.service';
import { NavService } from './services/nav.service';
import { AlarmStateService } from '../../core/alarm/services/alarm-state.service';
import { UserRole } from '../../core/models/user-role.enum';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { provideRouter, Router } from '@angular/router'; 
import { VIMAR_CLOUD_API_SERVICE } from '../../core/services/vimar-cloud-api.service.interface';
import { AlarmManagementRefreshService } from '../../core/alarm/services/alarm-management-refresh.service';
import { NotificationEvent } from '../notification/models/notification-event.model';

@Component({ template: '', standalone: true })
class DummyRouteComponent {}


describe('MainLayoutComponent', () => {
    let component: MainLayoutComponent;
    let fixture: ComponentFixture<MainLayoutComponent>;
    let notificationsSubject: BehaviorSubject<NotificationEvent[]>;
    let originalResizeObserver: typeof ResizeObserver | undefined;

    const mockAuthService = {
        getRole: vi.fn(),
        getCurrentUser$: vi.fn().mockReturnValue(
            of({
                userId: '1',
                username: 'admin',
                role: UserRole.AMMINISTRATORE,
                accessToken: 'token',
                isFirstAccess: false,
            })
        ),
        logout: vi.fn(),
        logoutFromBackend: vi.fn().mockReturnValue(of(void 0)),
    };
    const mockNavService = {
        getNavItems: vi.fn().mockReturnValue([{ label: 'Test', route: '/test' }])
    };
    const mockAlarmService = {
        getActiveAlarmsCount$: vi.fn().mockReturnValue(of(0)),
        getUnreadNotificationsCount$: vi.fn().mockReturnValue(of(0)),
        getNotifications$: vi.fn().mockReturnValue(of([])),
    };
    const mockMyVimarService = {
        getLinkedAccount: vi.fn().mockReturnValue(of({ email: '', isLinked: false })),
    };
    const mockAlarmManagementRefreshService = {
        requestRefresh: vi.fn(),
        getRefreshRequested$: vi.fn(),
    };
    
    beforeEach(async () => {
        vi.clearAllMocks();
        originalResizeObserver = globalThis.ResizeObserver;
        (globalThis as typeof globalThis & { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
            class ResizeObserverMock {
                public observe = vi.fn();
                public unobserve = vi.fn();
                public disconnect = vi.fn();
            } as unknown as typeof ResizeObserver;

        notificationsSubject = new BehaviorSubject<NotificationEvent[]>([]);
        mockAuthService.getRole.mockReturnValue(UserRole.AMMINISTRATORE);
        mockAuthService.getCurrentUser$.mockReturnValue(
            of({
                userId: '1',
                username: 'admin',
                role: UserRole.AMMINISTRATORE,
                accessToken: 'token',
                isFirstAccess: false,
            })
        );
        mockMyVimarService.getLinkedAccount.mockReturnValue(of({ email: '', isLinked: false }));
        mockAlarmService.getNotifications$.mockReturnValue(notificationsSubject.asObservable());

        await TestBed.configureTestingModule({
        imports: [MainLayoutComponent],
        providers: [
            { provide: InternalAuthService, useValue: mockAuthService },
            { provide: NavService, useValue: mockNavService },
            { provide: AlarmStateService, useValue: mockAlarmService },
            { provide: VIMAR_CLOUD_API_SERVICE, useValue: mockMyVimarService },
            { provide: AlarmManagementRefreshService, useValue: mockAlarmManagementRefreshService },
            provideRouter([
                { path: 'auth/login', component: DummyRouteComponent },
                { path: 'vimar-link', component: DummyRouteComponent },
            ])
        ]
        }).compileComponents();

        fixture = TestBed.createComponent(MainLayoutComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        if (originalResizeObserver) {
            (globalThis as typeof globalThis & { ResizeObserver: typeof ResizeObserver }).ResizeObserver = originalResizeObserver;
            return;
        }

        delete (globalThis as Partial<typeof globalThis> & { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
    });

    it('carica i NavItem con il ruolo corretto', () => {
        mockAuthService.getCurrentUser$.mockReturnValue(
            of({
                userId: '2',
                username: 'operator',
                role: UserRole.OPERATORE_SANITARIO,
                accessToken: 'token',
                isFirstAccess: false,
            })
        );
        component.ngOnInit();
        expect(mockNavService.getNavItems).toHaveBeenCalledWith(UserRole.OPERATORE_SANITARIO);
        expect(component.navItems.length).toBeGreaterThan(0);
    });

    it('reindirizza al login quando non esiste sessione utente', () => {
        mockAuthService.getCurrentUser$.mockReturnValue(of(null));
        const router = TestBed.inject(Router);
        const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

        component.ngOnInit();

        expect(component.navItems).toEqual([]);
        expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });

    it('mostra avviso topbar per admin senza account MyVimar collegato', () => {
        mockMyVimarService.getLinkedAccount.mockReturnValue(of({ email: '', isLinked: false }));

        component.ngOnInit();

        expect(mockMyVimarService.getLinkedAccount).toHaveBeenCalledTimes(1);
        expect(component.showVimarAssociationWarning).toBe(true);
    });

    it('non mostra avviso topbar quando account MyVimar risulta collegato', () => {
        mockMyVimarService.getLinkedAccount.mockReturnValue(of({ email: 'admin@test.it', isLinked: true }));

        component.ngOnInit();

        expect(component.showVimarAssociationWarning).toBe(false);
    });

    it('inverte correttamente isCollapsed con il segnale ricevuto', () => {
        expect(component.isCollapsed).toBe(true);
        
        component.toggleSidebar();
        expect(component.isCollapsed).toBe(false);
        
        component.toggleSidebar();
        expect(component.isCollapsed).toBe(true);
    });

    it('invoca correttamente logout', () => {
        const router = TestBed.inject(Router);
        const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

        component.logout();

        expect(mockAuthService.logoutFromBackend).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });

    it('apre il pannello profilo e carica stato MyVimar', () => {
        component.ngOnInit();
        component.toggleProfilePanel();

        expect(component.isProfilePanelOpen).toBe(true);
        expect(mockMyVimarService.getLinkedAccount).toHaveBeenCalledTimes(2);
        expect(component.vimarAccount).toEqual({ email: '', isLinked: false });
    });

    it('apre il pannello profilo anche per utenti non admin ma senza caricare stato MyVimar', () => {
        mockAuthService.getCurrentUser$.mockReturnValue(
            of({
                userId: '2',
                username: 'operator',
                role: UserRole.OPERATORE_SANITARIO,
                accessToken: 'token',
                isFirstAccess: false,
            })
        );

        component.ngOnInit();

        component.toggleProfilePanel();

        expect(component.isProfilePanelOpen).toBe(true);
        expect(mockMyVimarService.getLinkedAccount).not.toHaveBeenCalled();
    });

    it('naviga a vimar-link dalla sezione profilo', () => {
        const router = TestBed.inject(Router);
        const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

        component.goToVimarLink();

        expect(navigateSpy).toHaveBeenCalledWith(['/vimar-link']);
    });

    it('richiede refresh allarmi attivi quando si clicca la stessa voce menu della pagina corrente', () => {
        const router = TestBed.inject(Router);
        vi.spyOn(router, 'url', 'get').mockReturnValue('/alarms/alarm-management');

        component.onNavItemSelected('alarms/alarm-management');

        expect(mockAlarmManagementRefreshService.requestRefresh).toHaveBeenCalledTimes(1);
    });


    it('dovrebbe collegarsi correttamente al conteggio delle notifiche non lette', async () => {
        const mockCount = 5;
        mockAlarmService.getUnreadNotificationsCount$.mockReturnValue(of(mockCount));

        fixture = TestBed.createComponent(MainLayoutComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
        const result = await firstValueFrom(component.unreadNotificationsCount$);
        expect(result).toBe(mockCount);
    });

    it('apre automaticamente il pannello notifiche quando arriva una nuova notifica realtime', () => {
        component.ngOnInit();
        expect(component.isNotificationPanelOpen).toBe(false);

        notificationsSubject.next([
            {
                notificationId: 'rt-1',
                title: '▲ Allarme test',
                sentAt: '2026-04-07T22:00:00.000Z',
                eventType: 'triggered',
            },
        ]);

        expect(component.isNotificationPanelOpen).toBe(true);
    });

});