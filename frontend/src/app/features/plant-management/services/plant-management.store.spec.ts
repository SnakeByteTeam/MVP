import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssignmentOperationsService } from './assignment-operations.service';
import { PlantManagementStore } from './plant-management.store';
import { WardOperationsService } from './ward-operations.service';
import { WardStore } from './ward.store';
import { ApartmentApiService } from '../../apartment-monitor/services/apartment-api.service';

describe('PlantManagementStore', () => {
    let store: PlantManagementStore;

    const wardStoreStub = {
        wards$: of([]),
        isLoading$: of(false),
        error$: of(null),
        setLoading: vi.fn(),
        setError: vi.fn(),
        patchApartment: vi.fn(),
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
        assignApartment: vi.fn(),
        removeApartment: vi.fn(),
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
        assignmentOperationsStub.assignApartment.mockReturnValue(of(void 0));
        assignmentOperationsStub.removeApartment.mockReturnValue(of(void 0));

        apartmentApiStub.enableApartment.mockReturnValue(of(void 0));
        apartmentApiStub.disableApartment.mockReturnValue(of(void 0));

        TestBed.configureTestingModule({
            providers: [
                PlantManagementStore,
                { provide: WardStore, useValue: wardStoreStub },
                { provide: WardOperationsService, useValue: wardOperationsStub },
                { provide: AssignmentOperationsService, useValue: assignmentOperationsStub },
                { provide: ApartmentApiService, useValue: apartmentApiStub },
            ],
        });

        store = TestBed.inject(PlantManagementStore);
    });

    it('loadWards imposta loading e delega a WardOperationsService', () => {
        store.loadWards();

        expect(wardStoreStub.setLoading).toHaveBeenCalledWith(true);
        expect(wardStoreStub.setLoading).toHaveBeenCalledTimes(1);
        expect(wardOperationsStub.loadWards).toHaveBeenCalledOnce();
    });

    it('create/update/delete delegano al service corretto', () => {
        store.createWard({ name: 'Cardio' });
        store.updateWard('ward-1', { name: 'Cardio A' });
        store.deleteWard('ward-1');

        expect(wardOperationsStub.createWard).toHaveBeenCalledWith({ name: 'Cardio' });
        expect(wardOperationsStub.updateWard).toHaveBeenCalledWith('ward-1', { name: 'Cardio A' });
        expect(wardOperationsStub.deleteWard).toHaveBeenCalledWith('ward-1');
        expect(wardStoreStub.setLoading).toHaveBeenCalledTimes(3);
    });

    it('assign/remove operator e apartment delegano ad AssignmentOperationsService', () => {
        store.assignOperator('ward-1', { userId: 'user-2' });
        store.removeOperator('ward-1', 'user-2');
        store.assignApartment('ward-1', { apartmentId: 'apt-2' });
        store.removeApartment('ward-1', 'apt-2');

        expect(assignmentOperationsStub.assignOperator).toHaveBeenCalledWith('ward-1', {
            userId: 'user-2',
        });
        expect(assignmentOperationsStub.removeOperator).toHaveBeenCalledWith('ward-1', 'user-2');
        expect(assignmentOperationsStub.assignApartment).toHaveBeenCalledWith('ward-1', {
            apartmentId: 'apt-2',
        });
        expect(assignmentOperationsStub.removeApartment).toHaveBeenCalledWith('ward-1', 'apt-2');
        expect(wardStoreStub.setLoading).toHaveBeenCalledTimes(4);
    });

    it('enableApartment aggiorna store con isEnabled=true e loading=false', () => {
        store.enableApartment('apt-1');

        expect(apartmentApiStub.enableApartment).toHaveBeenCalledWith('apt-1');
        expect(wardStoreStub.patchApartment).toHaveBeenCalledWith('apt-1', { isEnabled: true });
        expect(wardStoreStub.setLoading).toHaveBeenCalledWith(false);
        expect(wardStoreStub.setError).not.toHaveBeenCalled();
    });

    it('disableApartment in errore salva messaggio di errore', () => {
        apartmentApiStub.disableApartment.mockReturnValue(throwError(() => new Error('No network')));

        store.disableApartment('apt-1');

        expect(wardStoreStub.setError).toHaveBeenCalledWith('No network');
        expect(wardStoreStub.patchApartment).not.toHaveBeenCalled();
        expect(wardStoreStub.setLoading).toHaveBeenCalledWith(true);
    });
});
