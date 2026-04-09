import { describe, beforeEach, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { UserRole } from '../../../core/models/user-role.enum';
import { NavService } from './nav.service';

describe('NavService', () => { 

    let service : NavService;
    
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [NavService]
        });
        service = TestBed.inject(NavService);
    });

    it('viene creato', () => {
        expect(service).toBeTruthy();
    });

    //ho fatto i test sui label perchè al momento sono più stabili dei nomi delle routes
    it('restituisce tutti i NavItems per AMMINISTRATORE', () => {
        const items = service.getNavItems(UserRole.AMMINISTRATORE);
            
        expect(items.length).toBeGreaterThan(0);

        expect(items.some(i => i.label === "Dashboard")).toBe(true);
        expect(items.some(i => i.route.includes('dashboard'))).toBe(true);

        expect(items.some(i => i.label === "Configurazione Allarmi")).toBe(true);
        expect(items.some(i => i.route.includes('alarm-configuration'))).toBe(true);

    });

    it('restituisce solo i NavItems filtrati per OPERATORE SANITARIO', () => {
        const items = service.getNavItems(UserRole.OPERATORE_SANITARIO);
            
        const OSSItems = items.filter(i => !i.requiredRole);
        expect(OSSItems.length).toBeGreaterThan(0);

        const roleReqItems = items.filter(i => i.requiredRole);
        expect(roleReqItems.length).toBe(0);

        expect(items.some(i => i.label === "Dashboard")).toBe(true);
        expect(items.some(i => i.route.includes('dashboard'))).toBe(true);
    });

})