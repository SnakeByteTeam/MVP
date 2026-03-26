import { Injectable } from '@angular/core';
import { UserRole } from '../../../core/models/user-role.enum';
import { NavItem } from '../../../core/models/nav-item.model';

@Injectable({ providedIn: 'root' })
export class NavService {
    public getNavItems(role: UserRole): NavItem[]{
        //routes provvisorie, da definire e confrontare con app.routes.ts
        const NavItemList : NavItem[] = [
            {
                label: "Dashboard",
                icon: "",
                route: "dashboard"
            },
            {
                label: "Dispositivi",
                icon: "",
                route: "apartment-monitor"
            },
            {
                label: "Allarmi attivi",
                icon: "",
                route: "alarms/alarm-management"
            },
            {
                label: "Storico allarmi",
                icon: "",
                route: "alarms/alarm-history"
            },
            {
                label: "Gestione allarmi",
                icon: "",
                route: "alarm-configuration",
                requiredRole: UserRole.AMMINISTRATORE
            },
            {
                label: "Analytics",
                icon: "",
                route: "analytics"
            },
            {
                label: "Gestione Reparti",
                icon: "",
                route: "ward-management",
                requiredRole: UserRole.AMMINISTRATORE
            },
            {
                label: "Gestione Utenti",
                icon: "",
                route: "user-management",
                requiredRole: UserRole.AMMINISTRATORE
            },
        ];

        let filteredList = NavItemList;
        if(role === UserRole.OPERATORE_SANITARIO)
            filteredList = NavItemList.filter(n => !n.requiredRole); // !undefined = true

        return filteredList;
    }
}
