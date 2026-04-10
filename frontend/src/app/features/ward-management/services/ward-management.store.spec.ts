import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../../core/models/user-role.enum';
import { AssignmentOperationsService } from './assignment-operations.service';
import { WardManagementStore } from './ward-management.store';
import { WardOperationsService } from './ward-operations.service';
import { WardStore } from './ward.store';

describe('WardManagementStore', () => {
    let store: WardManagementStore;

    const wardStoreStub = {
        wards$: of([]),
        isLoading$: of(false),
        error$: of(null),
        setLoading: vi.fn(),
        setError: vi.fn(),
    };

    const wardOperationsStub = {
        loadWards: vi.fn(),
        createWard: vi.fn(),
        updateWard: vi.fn(),
        deleteWard: vi.fn(),
    };

    const assignmentOperationsStub = {
        assignOperator: vi.fn(),
        removeOperator: vi.fn(),
        assignPlant: vi.fn(),
        removePlant: vi.fn(),
        getAvailableUsersForWard: vi.fn(),
        getAvailablePlantsForWard: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        wardOperationsStub.loadWards.mockReturnValue(of(void 0));
        wardOperationsStub.createWard.mockReturnValue(of(void 0));
        wardOperationsStub.updateWard.mockReturnValue(of(void 0));
        wardOperationsStub.deleteWard.mockReturnValue(of(void 0));

        assignmentOperationsStub.assignOperator.mockReturnValue(of(void 0));
        assignmentOperationsStub.removeOperator.mockReturnValue(of(void 0));
        assignmentOperationsStub.assignPlant.mockReturnValue(of(void 0));
        assignmentOperationsStub.removePlant.mockReturnValue(of(void 0));
        assignmentOperationsStub.getAvailableUsersForWard.mockReturnValue(of([]));
        assignmentOperationsStub.getAvailablePlantsForWard.mockReturnValue(of([]));

        TestBed.configureTestingModule({
            providers: [
                WardManagementStore,
                { provide: WardStore, useValue: wardStoreStub },
                { provide: WardOperationsService, useValue: wardOperationsStub },
                { provide: AssignmentOperationsService, useValue: assignmentOperationsStub },
            ],
        });

        store = TestBed.inject(WardManagementStore);
    });

    it('loadWards imposta loading e delega a WardOperationsService', () => {
        store.loadWards();

        expect(wardStoreStub.setLoading).toHaveBeenCalledWith(true);
        expect(wardStoreStub.setLoading).toHaveBeenCalledTimes(1);
        expect(wardOperationsStub.loadWards).toHaveBeenCalledOnce();
    });

    it('create/update/delete delegano al service corretto', () => {
        store.createWard({ name: 'Cardio' });
        store.updateWard(1, { name: 'Cardio A' });
        store.deleteWard(1);

        expect(wardOperationsStub.createWard).toHaveBeenCalledWith({ name: 'Cardio' });
        expect(wardOperationsStub.updateWard).toHaveBeenCalledWith(1, { name: 'Cardio A' });
        expect(wardOperationsStub.deleteWard).toHaveBeenCalledWith(1);
        expect(wardStoreStub.setLoading).toHaveBeenCalledTimes(3);
    });

    it('assign/remove operator e plant delegano ad AssignmentOperationsService', () => {
        store.assignOperator(1, { userId: 2 });
        store.removeOperator(1, 2);
        store.assignPlant(1, { plantId: '102' });
        store.removePlant(1, '102');

        expect(assignmentOperationsStub.assignOperator).toHaveBeenCalledWith(1, {
            userId: 2,
        });
        expect(assignmentOperationsStub.removeOperator).toHaveBeenCalledWith(1, 2);
        expect(assignmentOperationsStub.assignPlant).toHaveBeenCalledWith(1, {
            plantId: '102',
        });
        expect(assignmentOperationsStub.removePlant).toHaveBeenCalledWith(1, '102');
        expect(wardStoreStub.setLoading).toHaveBeenCalledTimes(4);
    });

    it('getAvailablePlantsForWard delega ad AssignmentOperationsService', async () => {
        assignmentOperationsStub.getAvailablePlantsForWard.mockReturnValue(
            of([{ id: '200', name: 'App. 200' }]),
        );

        const result = await firstValueFrom(store.getAvailablePlantsForWard(10));

        expect(assignmentOperationsStub.getAvailablePlantsForWard).toHaveBeenCalledWith(10);
        expect(result).toEqual([{ id: '200', name: 'App. 200' }]);
        expect(wardStoreStub.setError).not.toHaveBeenCalled();
    });

    it('getAvailablePlantsForWard in errore ritorna null e setta errore', async () => {
        assignmentOperationsStub.getAvailablePlantsForWard.mockReturnValue(
            throwError(() => new Error('fetch failed')),
        );

        const result = await firstValueFrom(store.getAvailablePlantsForWard(10));

        expect(result).toBeNull();
        expect(wardStoreStub.setError).toHaveBeenCalledWith('fetch failed');
    });

    it('getAvailablePlantsForWard con errore non strutturato usa il messaggio di fallback', async () => {
        assignmentOperationsStub.getAvailablePlantsForWard.mockReturnValue(
            throwError(() => ({ bad: true })),
        );

        const result = await firstValueFrom(store.getAvailablePlantsForWard(10));

        expect(result).toBeNull();
        expect(wardStoreStub.setError).toHaveBeenCalledWith('Operazione plant non riuscita.');
    });

    it('getAvailableUsersForWard delega ad AssignmentOperationsService', async () => {
        assignmentOperationsStub.getAvailableUsersForWard.mockReturnValue(
            of([{ id: 7, firstName: 'Mario', lastName: 'Rossi', username: 'mrossi', role: UserRole.OPERATORE_SANITARIO }]),
        );

        const result = await firstValueFrom(store.getAvailableUsersForWard(10));

        expect(assignmentOperationsStub.getAvailableUsersForWard).toHaveBeenCalledWith(10);
        expect(result).toEqual([{ id: 7, firstName: 'Mario', lastName: 'Rossi', username: 'mrossi', role: UserRole.OPERATORE_SANITARIO }]);
        expect(wardStoreStub.setError).not.toHaveBeenCalled();
    });

    it('getAvailableUsersForWard in errore ritorna null e setta errore', async () => {
        assignmentOperationsStub.getAvailableUsersForWard.mockReturnValue(
            throwError(() => new Error('users fetch failed')),
        );

        const result = await firstValueFrom(store.getAvailableUsersForWard(10));

        expect(result).toBeNull();
        expect(wardStoreStub.setError).toHaveBeenCalledWith('users fetch failed');
    });
});
