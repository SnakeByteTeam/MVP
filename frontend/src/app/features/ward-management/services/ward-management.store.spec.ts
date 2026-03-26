import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssignmentOperationsService } from './assignment-operations.service';
import { WardManagementStore } from './ward-management.store';
import { WardOperationsService } from './ward-operations.service';
import { WardStore } from './ward.store';
import { ApartmentApiService } from '../../apartment-monitor/services/apartment-api.service';

describe('WardManagementStore', () => {
    let store: WardManagementStore;

    const wardStoreStub = {
        wards$: of([]),
        isLoading$: of(false),
        error$: of(null),
        setLoading: vi.fn(),
        setError: vi.fn(),
        patchPlant: vi.fn(),
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
    };

    const apartmentApiStub = {
        enableApartment: vi.fn(),
        disableApartment: vi.fn(),
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

        apartmentApiStub.enableApartment.mockReturnValue(of(void 0));
        apartmentApiStub.disableApartment.mockReturnValue(of(void 0));

        TestBed.configureTestingModule({
            providers: [
                WardManagementStore,
                { provide: WardStore, useValue: wardStoreStub },
                { provide: WardOperationsService, useValue: wardOperationsStub },
                { provide: AssignmentOperationsService, useValue: assignmentOperationsStub },
                { provide: ApartmentApiService, useValue: apartmentApiStub },
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
        store.assignPlant(1, { plantId: 102 });
        store.removePlant(1, 102);

        expect(assignmentOperationsStub.assignOperator).toHaveBeenCalledWith(1, {
            userId: 2,
        });
        expect(assignmentOperationsStub.removeOperator).toHaveBeenCalledWith(1, 2);
        expect(assignmentOperationsStub.assignPlant).toHaveBeenCalledWith(1, {
            plantId: 102,
        });
        expect(assignmentOperationsStub.removePlant).toHaveBeenCalledWith(1, 102);
        expect(wardStoreStub.setLoading).toHaveBeenCalledTimes(4);
    });

    it('enablePlant aggiorna store con isEnabled=true e loading=false', () => {
        store.enablePlant(101);

        expect(apartmentApiStub.enableApartment).toHaveBeenCalledWith('101');
        expect(wardStoreStub.patchPlant).toHaveBeenCalledWith(101, { isEnabled: true });
        expect(wardStoreStub.setLoading).toHaveBeenCalledWith(false);
        expect(wardStoreStub.setError).not.toHaveBeenCalled();
    });

    it('disablePlant in errore salva messaggio di errore', () => {
        apartmentApiStub.disableApartment.mockReturnValue(throwError(() => new Error('No network')));

        store.disablePlant(101);

        expect(wardStoreStub.setError).toHaveBeenCalledWith('No network');
        expect(wardStoreStub.patchPlant).not.toHaveBeenCalled();
        expect(wardStoreStub.setLoading).toHaveBeenCalledWith(true);
    });
});
