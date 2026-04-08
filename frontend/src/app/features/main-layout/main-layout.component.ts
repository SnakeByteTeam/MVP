
import { Component, inject, ChangeDetectionStrategy, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavItem } from '../../core/models/nav-item.model';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { NavService } from './services/nav.service';
import { InternalAuthService } from '../../core/services/internal-auth.service';
import { AlarmStateService } from '../../core/alarm/services/alarm-state.service';
import { TopbarComponent } from './components/topbar/topbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { UserRole } from '../../core/models/user-role.enum';
import { Router, RouterOutlet } from '@angular/router';
import { UserInfo } from '../../core/models/user-info.model';
import { NotificationEvent } from '../notification/models/notification-event.model';
import { NotificationTopbarPanelComponent } from '../notification/components/notification-topbar-panel-component/notification-topbar-panel-component';
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
        NotificationTopbarPanelComponent,
        SidebarComponent
    ],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.css'})
export class MainLayoutComponent implements OnInit, OnDestroy {
    public isCollapsed: boolean = true;
    public navItems!: NavItem[];
    public isProfilePanelOpen = false;
    public isAdmin = false;
    public isVimarStatusLoading = false;
    public vimarStatusError = '';
    public vimarAccount: MyVimarAccount | null = null;
    public showVimarAssociationWarning = false;
    public isNotificationPanelOpen = false;
    public realtimeToastMessage: string | null = null;
    public realtimeToastKind: 'alert' | 'success' = 'alert';

    private readonly navService = inject(NavService);
    private readonly internalAuthService = inject(InternalAuthService);
    private readonly alarmStateService = inject(AlarmStateService);
    private readonly alarmManagementRefreshService = inject(AlarmManagementRefreshService);
    private readonly router = inject(Router);
    private readonly myVimarService = inject(VIMAR_CLOUD_API_SERVICE, { optional: true }) as IVimarCloudApiService | null;
    public readonly unreadNotificationsCount$ = this.alarmStateService.getUnreadNotificationsCount$();
    public readonly notifications$: Observable<NotificationEvent[]> = this.alarmStateService.getNotifications$();
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly destroy$ = new Subject<void>();
    private toastTimer: ReturnType<typeof setTimeout> | null = null;
    private latestRealtimeNotificationId: string | null = null;

    public currentUser : UserInfo = {
        username: '',
        firstName: '',
        lastName: '',
        role: UserRole.OPERATORE_SANITARIO
    };

    public activeAlarmCount$ : Observable<number> = this.alarmStateService.getActiveAlarmsCount$();

    public ngOnInit(): void{
        this.bindRealtimeAlarmNotifications();

        this.internalAuthService
            .getCurrentUser$()
            .pipe(take(1), takeUntil(this.destroy$))
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
                this.isAdmin = session.role === UserRole.AMMINISTRATORE;
                this.navItems = this.navService.getNavItems(session.role);

                if (this.isAdmin) {
                    this.loadVimarStatus();
                }

                this.cdr.markForCheck();
            });
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.clearToastTimer();
    }

    public toggleSidebar(): void{
        this.isCollapsed = !this.isCollapsed;
    }

    public toggleProfilePanel(): void {
        this.closeNotificationPanel();

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
        this.closeNotificationPanel();

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

    public toggleNotificationPanel(): void {
        this.closeProfilePanel();
        this.isNotificationPanelOpen = !this.isNotificationPanelOpen;
    }

    public closeNotificationPanel(): void {
        this.isNotificationPanelOpen = false;
    }

    public openNotificationsArchive(): void {
        this.closeNotificationPanel();
        void this.router.navigate(['/notifications']);
    }

    public openNotificationsArchiveFromPreview(notificationId: string): void {
        this.closeNotificationPanel();

        void this.router.navigate(['/notifications'], {
            queryParams: { focus: notificationId },
        });
    }

    public removeTopbarNotification(notificationId: string): void {
        this.alarmStateService.removeNotification(notificationId);
    }

    public clearTopbarNotifications(): void {
        this.alarmStateService.clearNotifications();
    }

    public logout(): void{
        this.closeNotificationPanel();
        this.internalAuthService.logoutFromBackend().subscribe(() => {
            void this.router.navigate(['/auth/login']);
        });
    }

    public canOpenProfilePanel(): boolean {
        const role = this.internalAuthService.getRole() ?? this.currentUser.role;
        return role === UserRole.AMMINISTRATORE;
    }

    private bindRealtimeAlarmNotifications(): void {
        this.alarmStateService
            .getNotifications$()
            .pipe(takeUntil(this.destroy$))
            .subscribe((notifications) => {
                const latest = notifications[0];
                if (!latest || latest.notificationId === this.latestRealtimeNotificationId) {
                    return;
                }

                this.latestRealtimeNotificationId = latest.notificationId;
                this.openRealtimeNotificationPanel();
            });
    }

    private openRealtimeNotificationPanel(): void {
        this.clearToastTimer();
        this.realtimeToastMessage = null;
        this.closeProfilePanel();

        if (this.isNotificationPanelOpen) {
            this.cdr.markForCheck();
            return;
        }

        this.isNotificationPanelOpen = true;
        this.cdr.markForCheck();
    }

    private showRealtimeToast(message: string, kind: 'alert' | 'success'): void {
        this.clearToastTimer();
        this.realtimeToastMessage = message;
        this.realtimeToastKind = kind;
        this.cdr.markForCheck();

        this.toastTimer = setTimeout(() => {
            this.realtimeToastMessage = null;
            this.cdr.markForCheck();
            this.toastTimer = null;
        }, 5000);
    }

    private clearToastTimer(): void {
        if (!this.toastTimer) {
            return;
        }

        clearTimeout(this.toastTimer);
        this.toastTimer = null;
    }

    private loadVimarStatus(): void {
        if (!this.myVimarService) {
            this.vimarAccount = { email: '', isLinked: false };
            this.vimarStatusError = 'Servizio MyVimar non disponibile in questa sezione.';
            this.isVimarStatusLoading = false;
            this.showVimarAssociationWarning = false;
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
                this.showVimarAssociationWarning = this.canOpenProfilePanel() && !account.isLinked;
                this.cdr.markForCheck();
            },
            error: () => {
                this.vimarAccount = { email: '', isLinked: false };
                this.vimarStatusError = 'Impossibile recuperare lo stato del collegamento MyVimar.';
                this.isVimarStatusLoading = false;
                this.showVimarAssociationWarning = false;
                this.cdr.markForCheck();
            }
        });
    }
}
