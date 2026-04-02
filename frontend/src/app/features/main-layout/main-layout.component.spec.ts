import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { InternalAuthService } from '../../core/services/internal-auth.service';
import { NavService } from './services/nav.service';
import { AlarmStateService } from '../../core/alarm/services/alarm-state.service';
import { UserRole } from '../../core/models/user-role.enum';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom } from 'rxjs'; 
import { provideRouter, Router } from '@angular/router'; 
import { VIMAR_CLOUD_API_SERVICE } from '../../core/services/vimar-cloud-api.service.interface';


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
        expect(component.isCollapsed).toBe(false);
        
        component.toggleSidebar();
        expect(component.isCollapsed).toBe(true);
        
        component.toggleSidebar();
        expect(component.isCollapsed).toBe(false);
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