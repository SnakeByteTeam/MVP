import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NavItem } from '../../../../core/models/nav-item.model';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({ 
    selector: 'app-sidebar', 
    standalone: true, 
    imports: [
    RouterLink,       
    RouterLinkActive,
    ],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'})
export class SidebarComponent {
    @Input() navItems!: NavItem[];
    @Input() isCollapsed!: boolean;
    @Input() activeAlarmCount!: number;
    @Output() collapsed = new EventEmitter<void>();
}
