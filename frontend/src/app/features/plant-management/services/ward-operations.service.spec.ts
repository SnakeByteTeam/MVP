import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../../core/models/user-role.enum';
import type { Ward } from '../models/ward.model';
import { PlantApiService } from './plant-api.service';
import { WardOperationsService } from './ward-operations.service';
import { WardStore } from './ward.store';

describe('WardOperationsService', () => {
    let service: WardOperationsService;

    const ward: Ward = {
        id: 1,
        name: 'Cardiologia',
        apartments: [{ id: 101, name: 'App. 101', isEnabled: true }],
        operators: [
            {
                id: 'user-1',
                firstName: 'Mario',
                lastName: 'Rossi',
                username: 'mrossi',
                role: UserRole.OPERATORE_SANITARIO,
            },
        ],
    };

    const apiStub = {
        getWards: vi.fn(),
        createWard: vi.fn(),
        updateWard: vi.fn(),
        deleteWard: vi.fn(),
    };

    const storeStub = {
        setWards: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        addWard: vi.fn(),
        replaceWard: vi.fn(),
        removeWard: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        TestBed.configureTestingModule({
            providers: [
                WardOperationsService,
                { provide: PlantApiService, useValue: apiStub },
                { provide: WardStore, useValue: storeStub },
            ],
        });

        service = TestBed.inject(WardOperationsService);
    });

    it('loadWards aggiorna store e termina senza valore', () => {
        apiStub.getWards.mockReturnValue(of([ward]));

        service.loadWards().subscribe((result) => {
            expect(result).toBeUndefined();
        });

        expect(apiStub.getWards).toHaveBeenCalledOnce();
        expect(storeStub.setWards).toHaveBeenCalledWith([ward]);
        expect(storeStub.setWards).toHaveBeenCalledTimes(1);
        expect(storeStub.setLoading).toHaveBeenCalledWith(false);
        expect(storeStub.setLoading).toHaveBeenCalledTimes(1);
        expect(storeStub.setError).not.toHaveBeenCalled();
    });

    it('createWard con 409 imposta messaggio funzionale', () => {
        apiStub.createWard.mockReturnValue(
            throwError(() => new HttpErrorResponse({ status: 409, statusText: 'Conflict' }))
        );

        let emitted = false;
        service.createWard({ name: 'Duplicato' }).subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(storeStub.addWard).not.toHaveBeenCalled();
        expect(storeStub.setError).toHaveBeenCalledWith('Esiste gia un reparto con questo nome.');
        expect(storeStub.setError).toHaveBeenCalledTimes(1);
        expect(storeStub.setLoading).not.toHaveBeenCalled();
    });

    it('updateWard sostituisce il ward nel store', () => {
        const updatedWard: Ward = { ...ward, name: 'Cardiologia A' };
        apiStub.updateWard.mockReturnValue(of(updatedWard));

        service.updateWard(1, { name: 'Cardiologia A' }).subscribe();

        expect(apiStub.updateWard).toHaveBeenCalledWith(1, { name: 'Cardiologia A' });
        expect(storeStub.replaceWard).toHaveBeenCalledWith(updatedWard);
        expect(storeStub.replaceWard).toHaveBeenCalledTimes(1);
        expect(storeStub.setLoading).toHaveBeenCalledWith(false);
        expect(storeStub.setError).not.toHaveBeenCalled();
    });

    it('deleteWard rimuove il ward dal store', () => {
        apiStub.deleteWard.mockReturnValue(of(void 0));

        service.deleteWard(1).subscribe();

        expect(apiStub.deleteWard).toHaveBeenCalledWith(1);
        expect(storeStub.removeWard).toHaveBeenCalledWith(1);
        expect(storeStub.removeWard).toHaveBeenCalledTimes(1);
        expect(storeStub.setLoading).toHaveBeenCalledWith(false);
        expect(storeStub.setError).not.toHaveBeenCalled();
    });

    it('in caso di errore generico usa il fallback message', () => {
        apiStub.getWards.mockReturnValue(throwError(() => ({ unexpected: true })));

        service.loadWards().subscribe();

        expect(storeStub.setError).toHaveBeenCalledWith('Operazione sui reparti non riuscita.');
        expect(storeStub.setError).toHaveBeenCalledTimes(1);
        expect(storeStub.setWards).not.toHaveBeenCalled();
    });
});
