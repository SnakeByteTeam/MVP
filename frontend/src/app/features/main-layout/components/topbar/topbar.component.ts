import { Component,EventEmitter, Input, Output } from '@angular/core';
import { UserInfo } from '../../../../core/models/user-info.model';

@Component({ 
    selector: 'app-topbar', 
    standalone: true, 
    templateUrl: './topbar.component.html',
    styleUrl: './topbar.component.css'})
export class TopbarComponent {
    @Input() user!: UserInfo;
    @Output() profileClicked = new EventEmitter<void>();
    @Output() logoutClicked = new EventEmitter<void>();
}
