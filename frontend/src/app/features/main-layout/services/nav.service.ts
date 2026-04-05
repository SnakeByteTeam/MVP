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
                icon: "dashboard.png",
                route: "dashboard"
            },
            {
                label: "Dispositivi",
                icon: "device.png",
                route: "apartment-monitor"
            },
            {
                label: "Gestione Allarmi",
                icon: "alarm-management.png",
                route: "alarms/alarm-management"
            },
            {
                label: "Storico Allarmi",
                icon: "alarm-history.png",
                route: "alarms/alarm-history"
            },
            {
                label: "Configurazione Allarmi",
                icon: "alarm-configuration.png",
                route: "alarms/alarm-configuration",
                requiredRole: UserRole.AMMINISTRATORE
            },
            {
                label: "Analytics",
                icon: "analytics.png",
                route: "analytics"
            },
            {
                label: "Gestione Reparti",
                icon: "ward-management.png",
                route: "ward-management",
                requiredRole: UserRole.AMMINISTRATORE
            },
            {
                label: "Gestione Utenti",
                icon: "user-management.png",
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
