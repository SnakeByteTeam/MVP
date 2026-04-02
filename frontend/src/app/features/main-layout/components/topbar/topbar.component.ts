import { Component,EventEmitter, Input, Output } from '@angular/core';
import { UserInfo } from '../../../../core/models/user-info.model';
import { UserRole } from '../../../../core/models/user-role.enum';

@Component({ 
    selector: 'app-topbar', 
    standalone: true, 
    templateUrl: './topbar.component.html',
    styleUrl: './topbar.component.css'})
export class TopbarComponent {
    @Input() user!: UserInfo;
    @Input() isProfileActive = false;
    @Output() profileClicked = new EventEmitter<void>();
    @Output() logoutClicked = new EventEmitter<void>();

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
