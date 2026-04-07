import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../../core/models/user-role.enum';
import type { WardSummaryDto } from '../models/ward-api.dto';
import type { Ward } from '../models/ward.model';
import { WardApiService } from './ward-api.service';
import { WardOperationsService } from './ward-operations.service';
import { WardStore } from './ward.store';

describe('WardOperationsService', () => {
    let service: WardOperationsService;

    const ward: Ward = {
        id: 1,
        name: 'Cardiologia',
        apartments: [{ id: '101', name: 'App. 101' }],
        operators: [
            {
                id: 1,
                firstName: 'Mario',
                lastName: 'Rossi',
                username: 'mrossi',
                role: UserRole.OPERATORE_SANITARIO,
            },
        ],
    };

    const hydratedWard: Ward = {
        id: 1,
        name: 'Cardiologia',
        apartments: [{ id: '101', name: 'App. 101' }],
        operators: [
            {
                id: 1,
                firstName: 'mrossi',
                lastName: '',
                username: 'mrossi',
                role: UserRole.OPERATORE_SANITARIO,
            },
        ],
    };

    const wardSummaries: WardSummaryDto[] = [{ id: 1, name: 'Cardiologia' }];

    const apiStub = {
        getWards: vi.fn(),
        getPlantsByWardId: vi.fn(),
        getOperatorsByWardId: vi.fn(),
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
        getWardsSnapshot: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        TestBed.configureTestingModule({
            providers: [
                WardOperationsService,
                { provide: WardApiService, useValue: apiStub },
                { provide: WardStore, useValue: storeStub },
            ],
        });

        service = TestBed.inject(WardOperationsService);
    });

    it('loadWards aggiorna store e termina senza valore', () => {
        storeStub.getWardsSnapshot.mockReturnValue([]);
        apiStub.getWards.mockReturnValue(of(wardSummaries));
        //id e name riferiscono al plant (vedi WardPlantDto)
        apiStub.getPlantsByWardId.mockReturnValue(of([{ id: '101', name: 'App. 101' }]));
        apiStub.getOperatorsByWardId.mockReturnValue(of([{ id: 1, username: 'mrossi' }]));

        service.loadWards().subscribe((result) => {
            expect(result).toBeUndefined();
        });

        expect(apiStub.getWards).toHaveBeenCalledOnce();
        expect(apiStub.getPlantsByWardId).toHaveBeenCalledWith(1);
        expect(apiStub.getOperatorsByWardId).toHaveBeenCalledWith(1);
        expect(storeStub.setWards).toHaveBeenCalledWith([hydratedWard]);
        expect(storeStub.setWards).toHaveBeenCalledTimes(1);
        expect(storeStub.setLoading).toHaveBeenCalledWith(false);
        expect(storeStub.setLoading).toHaveBeenCalledTimes(1);
        expect(storeStub.setError).not.toHaveBeenCalled();
    });

    it('loadWards idrata piu reparti e concatena le relationship in ordine', () => {
        storeStub.getWardsSnapshot.mockReturnValue([]);
        apiStub.getWards.mockReturnValue(of([wardSummaries[0], { id: 2, name: 'Neurologia' }]));
        apiStub.getPlantsByWardId.mockImplementation((wardId: number) => {
            if (wardId === 1) {
                return of([{ id: '101', name: 'App. 101' }]);
            }

            return of([{ id: '201', name: 'App. 201' }]);
        });
        apiStub.getOperatorsByWardId.mockImplementation((wardId: number) => {
            if (wardId === 1) {
                return of([{ id: 1, username: 'mrossi' }]);
            }

            return of([{ id: 2, username: 'lverdi' }]);
        });

        service.loadWards().subscribe();

        expect(storeStub.setWards).toHaveBeenCalledWith([
            hydratedWard,
            {
                id: 2,
                name: 'Neurologia',
                apartments: [{ id: '201', name: 'App. 201' }],
                operators: [
                    {
                        id: 2,
                        firstName: 'lverdi',
                        lastName: '',
                        username: 'lverdi',
                        role: UserRole.OPERATORE_SANITARIO,
                    },
                ],
            },
        ]);
    });

    it('loadWards con lista vuota non richiama le relationship API', () => {
        storeStub.getWardsSnapshot.mockReturnValue([]);
        apiStub.getWards.mockReturnValue(of([]));

        service.loadWards().subscribe();

        expect(apiStub.getWards).toHaveBeenCalledOnce();
        expect(apiStub.getPlantsByWardId).not.toHaveBeenCalled();
        expect(apiStub.getOperatorsByWardId).not.toHaveBeenCalled();
        expect(storeStub.setWards).toHaveBeenCalledWith([]);
        expect(storeStub.setLoading).toHaveBeenCalledWith(false);
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

    it('createWard normalizza payload minimale mantenendo il modello Ward coerente', () => {
        apiStub.createWard.mockReturnValue(of({ id: 11, name: 'Oncologia' } as unknown as Ward));
        storeStub.getWardsSnapshot.mockReturnValue([]);

        service.createWard({ name: 'Oncologia' }).subscribe();

        expect(storeStub.addWard).toHaveBeenCalledWith({
            id: 11,
            name: 'Oncologia',
            apartments: [],
            operators: [],
        });
        expect(storeStub.setLoading).toHaveBeenCalledWith(false);
    });

    it('createWard preserva apartments/operators dallo snapshot se il backend non li restituisce', () => {
        storeStub.getWardsSnapshot.mockReturnValue([ward]);
        apiStub.createWard.mockReturnValue(of({ id: 1, name: 'Cardiologia nuova' } as unknown as Ward));

        service.createWard({ name: 'Cardiologia nuova' }).subscribe();

        expect(storeStub.addWard).toHaveBeenCalledWith({
            id: 1,
            name: 'Cardiologia nuova',
            apartments: ward.apartments,
            operators: ward.operators,
        });
    });

    it('updateWard sostituisce il ward nel store', () => {
        const updatedWard: Ward = { ...ward, name: 'Cardiologia A' };
        storeStub.getWardsSnapshot.mockReturnValue([ward]);
        apiStub.updateWard.mockReturnValue(of(updatedWard));

        service.updateWard(1, { name: 'Cardiologia A' }).subscribe();

        expect(apiStub.updateWard).toHaveBeenCalledWith(1, { name: 'Cardiologia A' });
        expect(storeStub.replaceWard).toHaveBeenCalledWith(updatedWard);
        expect(storeStub.replaceWard).toHaveBeenCalledTimes(1);
        expect(storeStub.setLoading).toHaveBeenCalledWith(false);
        expect(storeStub.setError).not.toHaveBeenCalled();
    });

    it('updateWard preserva apartments/operators quando backend restituisce solo id e name', () => {
        storeStub.getWardsSnapshot.mockReturnValue([ward]);
        apiStub.updateWard.mockReturnValue(of({ id: 1, name: 'Cardiologia X' } as unknown as Ward));

        service.updateWard(1, { name: 'Cardiologia X' }).subscribe();

        expect(storeStub.replaceWard).toHaveBeenCalledWith({
            id: 1,
            name: 'Cardiologia X',
            apartments: ward.apartments,
            operators: ward.operators,
        });
        expect(storeStub.setLoading).toHaveBeenCalledWith(false);
    });

    it('updateWard gestisce errore HTTP con messaggio testuale del server', () => {
        storeStub.getWardsSnapshot.mockReturnValue([ward]);
        apiStub.updateWard.mockReturnValue(
            throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server error', error: 'update failed' }))
        );

        service.updateWard(1, { name: 'Cardiologia X' }).subscribe();

        expect(storeStub.setError).toHaveBeenCalledWith('update failed');
        expect(storeStub.replaceWard).not.toHaveBeenCalled();
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

    it('deleteWard usa il fallback generico quando l errore non e strutturato', () => {
        apiStub.deleteWard.mockReturnValue(throwError(() => ({ unexpected: true })));

        service.deleteWard(1).subscribe();

        expect(storeStub.setError).toHaveBeenCalledWith('Operazione sui reparti non riuscita.');
        expect(storeStub.removeWard).not.toHaveBeenCalled();
    });

    it('createWard usa il fallback generico quando l errore non e strutturato', () => {
        apiStub.createWard.mockReturnValue(throwError(() => ({ unexpected: true })));

        service.createWard({ name: 'Test' }).subscribe();

        expect(storeStub.setError).toHaveBeenCalledWith('Operazione sui reparti non riuscita.');
    });

    it('in caso di errore generico usa il fallback message', () => {
        apiStub.getWards.mockReturnValue(throwError(() => ({ unexpected: true })));

        service.loadWards().subscribe();

        expect(storeStub.setError).toHaveBeenCalledWith('Operazione sui reparti non riuscita.');
        expect(storeStub.setError).toHaveBeenCalledTimes(1);
        expect(storeStub.setWards).not.toHaveBeenCalled();
    });

    it('loadWards normalizza apartments dal dto', () => {
        storeStub.getWardsSnapshot.mockReturnValue([
            {
                id: 99,
                name: 'Snapshot',
                apartments: [{ id: '101', name: 'App. 101' }],
                operators: [],
            },
        ]);
        apiStub.getWards.mockReturnValue(of(wardSummaries));
        apiStub.getPlantsByWardId.mockReturnValue(of([{ id: '101', name: 'App. 101' }]));
        apiStub.getOperatorsByWardId.mockReturnValue(of([{ id: 1, username: 'mrossi' }]));

        service.loadWards().subscribe();

        expect(storeStub.setWards).toHaveBeenCalledWith([
            {
                ...hydratedWard,
                apartments: [{ id: '101', name: 'App. 101' }],
            },
        ]);
    });
});
