import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NavItem } from '../../../../core/models/nav-item.model';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        RouterLink,
        RouterLinkActive,
        CommonModule,
    ],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
    @Input() navItems!: NavItem[];
    @Input() isCollapsed!: boolean;
    @Input() isProfileMode = false;
    @Input() canOpenProfile = false;
    @Output() profileClicked = new EventEmitter<void>();
    @Output() collapsed = new EventEmitter<void>();
    @Output() navItemSelected = new EventEmitter<string>();
}
