
import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { NavItem } from '../../core/models/nav-item.model';
import { Observable } from 'rxjs';
import { NavService } from './services/nav.service';
import { InternalAuthService } from '../../core/services/internal-auth.service';
import { AlarmStateService } from '../../core/alarm/services/alarm-state.service';
import { UserSession } from '../user-auth/models/user-session.model';
import { TopbarComponent } from './components/topbar/topbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { UserRole } from '../../core/models/user-role.enum';
import { Router, RouterOutlet } from '@angular/router';
import { UserInfo } from '../../core/models/user-info.model';
import { NotificationBadgeComponent } from '../notification/components/notification-badge-component/notification-badge-component';

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
    public isCollapsed: boolean = false;
    public navItems!: NavItem[];

    private readonly navService = inject(NavService);
    private readonly internalAuthService = inject(InternalAuthService);
    private readonly alarmStateService = inject(AlarmStateService);
    private readonly router = inject(Router);

    public readonly unreadNotificationsCount$ = this.alarmStateService.getUnreadNotificationsCount$();

    //public currentUser$ : Observable<UserSession | null> = this.internalAuthService.getCurrentUser$();

    //temp mocks.... TO REMOVE
    //PROBLEMA: UserSession non permette di ricostruitre il nome e il cognome
    public userS : UserSession = {
        userId: "1",
        username: "username",
        role: UserRole.AMMINISTRATORE,
        accessToken: "aa",
        isFirstAccess: false
    };

    public currentUser : UserInfo = {
        username: "usern",
        firstName: "pippo",
        lastName: "pluto",
        role: UserRole.AMMINISTRATORE
    };
    //....

    public activeAlarmCount$ : Observable<number> = this.alarmStateService.getActiveAlarmsCount$();

    public ngOnInit(): void{
        const role = this.internalAuthService.getRole();
        if(role)
            this.navItems = this.navService.getNavItems(role);
        else{
            this.navItems = [];
            this.navItems = this.navService.getNavItems(UserRole.AMMINISTRATORE);//solo di prova
        }
    }

    public toggleSidebar(): void{
        this.isCollapsed = !this.isCollapsed;
    }

    public logout(): void{
        this.internalAuthService.logoutFromBackend().subscribe(() => {
            void this.router.navigate(['/auth/login']);
        });
    }
}
