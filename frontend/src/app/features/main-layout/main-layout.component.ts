
import { Component, inject, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavItem } from '../../core/models/nav-item.model';
import { Observable, take } from 'rxjs';
import { NavService } from './services/nav.service';
import { InternalAuthService } from '../../core/services/internal-auth.service';
import { AlarmStateService } from '../../core/alarm/services/alarm-state.service';
import { TopbarComponent } from './components/topbar/topbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { UserRole } from '../../core/models/user-role.enum';
import { Router, RouterOutlet } from '@angular/router';
import { UserInfo } from '../../core/models/user-info.model';
import { NotificationBadgeComponent } from '../notification/components/notification-badge-component/notification-badge-component';
import { MyVimarAccount } from '../my-vimar-integration/models/my-vimar-account.model';
import { IVimarCloudApiService, VIMAR_CLOUD_API_SERVICE } from '../../core/services/vimar-cloud-api.service.interface';
import { AlarmManagementRefreshService } from '../../core/alarm/services/alarm-management-refresh.service';

@Component({ 
    selector: 'app-main-layout', 
    standalone: true, 
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterOutlet,
        TopbarComponent,
        NotificationBadgeComponent,
        SidebarComponent
    ],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.css'})
export class MainLayoutComponent implements OnInit {
    public isCollapsed: boolean = true;
    public navItems!: NavItem[];
    public isProfilePanelOpen = false;
    public isAdmin = false;
    public isVimarStatusLoading = false;
    public vimarStatusError = '';
    public vimarAccount: MyVimarAccount | null = null;

    private readonly navService = inject(NavService);
    private readonly internalAuthService = inject(InternalAuthService);
    private readonly alarmStateService = inject(AlarmStateService);
    private readonly alarmManagementRefreshService = inject(AlarmManagementRefreshService);
    private readonly router = inject(Router);
    private readonly myVimarService = inject(VIMAR_CLOUD_API_SERVICE, { optional: true }) as IVimarCloudApiService | null;
    public readonly unreadNotificationsCount$ = this.alarmStateService.getUnreadNotificationsCount$();
    private readonly cdr = inject(ChangeDetectorRef);

    public currentUser : UserInfo = {
        username: '',
        firstName: '',
        lastName: '',
        role: UserRole.OPERATORE_SANITARIO
    };

    public activeAlarmCount$ : Observable<number> = this.alarmStateService.getActiveAlarmsCount$();

    public ngOnInit(): void{
        this.internalAuthService
            .getCurrentUser$()
            .pipe(take(1))
            .subscribe((session) => {
                if (!session) {
                    this.navItems = [];
                    void this.router.navigate(['/auth/login']);
                    return;
                }

                this.currentUser = {
                    username: session.username,
                    // The backend token does not include first/last name claims yet.
                    firstName: session.username,
                    lastName: '',
                    role: session.role,
                };
                this.navItems = this.navService.getNavItems(session.role);
                this.cdr.markForCheck();
            });
    }

    public toggleSidebar(): void{
        this.isCollapsed = !this.isCollapsed;
    }

    public toggleProfilePanel(): void {
        if (this.canOpenProfilePanel()) {
            this.isAdmin = true;
        } else {
            this.isAdmin = false;
            this.isProfilePanelOpen = false;
            return;
        }

        this.isProfilePanelOpen = !this.isProfilePanelOpen;

        if (this.isProfilePanelOpen) {
            this.loadVimarStatus();
        }
    }

    public closeProfilePanel(): void {
        this.isProfilePanelOpen = false;
    }

    public onNavItemSelected(route: string): void {
        this.closeProfilePanel();

        if (route !== 'alarms/alarm-management') {
            return;
        }

        if (!this.router.url.includes('/alarms/alarm-management')) {
            return;
        }

        this.alarmManagementRefreshService.requestRefresh();
    }

    public goToVimarLink(): void {
        void this.router.navigate(['/vimar-link']);
    }

    public logout(): void{
        this.internalAuthService.logoutFromBackend().subscribe(() => {
            void this.router.navigate(['/auth/login']);
        });
    }

    public canOpenProfilePanel(): boolean {
        const role = this.internalAuthService.getRole() ?? this.currentUser.role;
        return role === UserRole.AMMINISTRATORE;
    }

    private loadVimarStatus(): void {
        if (!this.myVimarService) {
            this.vimarAccount = { email: '', isLinked: false };
            this.vimarStatusError = 'Servizio MyVimar non disponibile in questa sezione.';
            this.isVimarStatusLoading = false;
            this.cdr.markForCheck();
            return;
        }

        this.isVimarStatusLoading = true;
        this.vimarStatusError = '';
        this.cdr.markForCheck();

        this.myVimarService.getLinkedAccount().subscribe({
            next: (account) => {
                this.vimarAccount = account;
                this.isVimarStatusLoading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.vimarAccount = { email: '', isLinked: false };
                this.vimarStatusError = 'Impossibile recuperare lo stato del collegamento MyVimar.';
                this.isVimarStatusLoading = false;
                this.cdr.markForCheck();
            }
        });
    }
}
