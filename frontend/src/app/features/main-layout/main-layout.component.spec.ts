import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { InternalAuthService } from '../../core/services/internal-auth.service';
import { NavService } from './services/nav.service';
import { AlarmStateService } from '../../core/alarm/services/alarm-state.service';
import { UserRole } from '../../core/models/user-role.enum';
import { firstValueFrom, of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { provideRouter, Router } from '@angular/router'; 
import { VIMAR_CLOUD_API_SERVICE } from '../../core/services/vimar-cloud-api.service.interface';
import { AlarmManagementRefreshService } from '../../core/alarm/services/alarm-management-refresh.service';


describe('MainLayoutComponent', () => {
    let component: MainLayoutComponent;
    let fixture: ComponentFixture<MainLayoutComponent>;

    const mockAuthService = {
        getRole: vi.fn(),
        logout: vi.fn(),
        logoutFromBackend: vi.fn().mockReturnValue(of(void 0)),
    };
    const mockNavService = {
        getNavItems: vi.fn().mockReturnValue([{ label: 'Test', route: '/test' }])
    };
    const mockAlarmService = {
        getActiveAlarmsCount$: vi.fn().mockReturnValue(of(0)),
        getUnreadNotificationsCount$: vi.fn().mockReturnValue(of(0))
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
        mockAuthService.getRole.mockReturnValue(UserRole.AMMINISTRATORE);

        await TestBed.configureTestingModule({
        imports: [MainLayoutComponent],
        providers: [
            { provide: InternalAuthService, useValue: mockAuthService },
            { provide: NavService, useValue: mockNavService },
            { provide: AlarmStateService, useValue: mockAlarmService },
            { provide: VIMAR_CLOUD_API_SERVICE, useValue: mockMyVimarService },
            { provide: AlarmManagementRefreshService, useValue: mockAlarmManagementRefreshService },
            provideRouter([])
        ]
        }).compileComponents();

        fixture = TestBed.createComponent(MainLayoutComponent);
        component = fixture.componentInstance;
    });

    it('carica i NavItem con il ruolo corretto', () => {
        mockAuthService.getRole.mockReturnValue(UserRole.OPERATORE_SANITARIO);
        component.ngOnInit();
        expect(mockNavService.getNavItems).toHaveBeenCalledWith(UserRole.OPERATORE_SANITARIO);
        expect(component.navItems.length).toBeGreaterThan(0);
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
        component.toggleProfilePanel();

        expect(component.isProfilePanelOpen).toBe(true);
        expect(mockMyVimarService.getLinkedAccount).toHaveBeenCalledTimes(1);
        expect(component.vimarAccount).toEqual({ email: '', isLinked: false });
    });

    it('non apre il pannello profilo per utenti non admin', () => {
        mockAuthService.getRole.mockReturnValue(UserRole.OPERATORE_SANITARIO);

        component.toggleProfilePanel();

        expect(component.isProfilePanelOpen).toBe(false);
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

});