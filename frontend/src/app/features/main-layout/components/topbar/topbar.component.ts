import { Component,EventEmitter, Input, Output } from '@angular/core';
import { UserInfo } from '../../../../core/models/user-info.model';
import { UserRole } from '../../../../core/models/user-role.enum';
import { AsyncPipe } from '@angular/common';
import { Breadcrumb, BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({ 
    selector: 'app-topbar', 
    standalone: true,
    imports:[AsyncPipe, RouterModule],
    templateUrl: './topbar.component.html',
    styleUrl: './topbar.component.css'})
export class TopbarComponent {
    @Input() user!: UserInfo;
    @Input() isProfileActive = false;
    @Input() showVimarWarning = false;
    @Output() profileClicked = new EventEmitter<void>();
    @Output() logoutClicked = new EventEmitter<void>();
    @Output() hamburgerClicked = new EventEmitter<void>();
    @Output() notificationClicked = new EventEmitter<void>();
    breadcrumbs$: Observable<Breadcrumb[]>;
    isNotificationActive = false;

    constructor(private readonly breadcrumbService: BreadcrumbService) {
        this.breadcrumbs$ = this.breadcrumbService.breadcrumbs$;
    }

    public onNotificationClick(): void {
        this.isNotificationActive = !this.isNotificationActive;
        this.notificationClicked.emit();
    }

    public onProfileClick(): void {
        if (!this.canOpenProfile) {
            return;
        }

        this.profileClicked.emit();
    }

    public get canOpenProfile(): boolean {
        return this.user?.role === UserRole.AMMINISTRATORE;
    }
}
