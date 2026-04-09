import {UserRole} from './user-role.enum'

export interface NavItem {
    label: string;
    icon: string;
    route: string;
    requiredRole?: UserRole;
}
