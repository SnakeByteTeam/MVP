import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../../core/models/user-role.enum';
import type { Ward } from '../models/ward.model';
import { AssignmentOperationsService } from './assignment-operations.service';
import { PlantApiService } from './plant-api.service';
import { WardStore } from './ward.store';

describe('AssignmentOperationsService', () => {
    let service: AssignmentOperationsService;

    const wards: Ward[] = [
        {
            id: 'ward-1',
            name: 'Cardiologia',
            apartments: [{ id: 'apt-1', name: 'App. 101', isEnabled: true }],
            operators: [
                {
                    id: 'user-1',
                    firstName: 'Mario',
                    lastName: 'Rossi',
                    username: 'mrossi',
                    role: UserRole.OPERATORE_SANITARIO,
                },
            ],
        },
    ];

    const apiStub = {
        assignOperatorToWard: vi.fn(),
        removeOperatorFromWard: vi.fn(),
        assignApartmentToWard: vi.fn(),
        removeApartmentFromWard: vi.fn(),
        getWards: vi.fn(),
    };

    const storeStub = {
        setWards: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        TestBed.configureTestingModule({
            providers: [
                AssignmentOperationsService,
                { provide: PlantApiService, useValue: apiStub },
                { provide: WardStore, useValue: storeStub },
            ],
        });

        service = TestBed.inject(AssignmentOperationsService);
    });

    it('assignOperator esegue operazione e poi ricarica i wards', () => {
        apiStub.assignOperatorToWard.mockReturnValue(of(void 0));
        apiStub.getWards.mockReturnValue(of(wards));

        service.assignOperator('ward-1', { userId: 'user-2' }).subscribe((result) => {
            expect(result).toBeUndefined();
        });

        expect(apiStub.assignOperatorToWard).toHaveBeenCalledWith('ward-1', { userId: 'user-2' });
        expect(apiStub.getWards).toHaveBeenCalledOnce();
        expect(storeStub.setWards).toHaveBeenCalledWith(wards);
        expect(storeStub.setWards).toHaveBeenCalledTimes(1);
        expect(storeStub.setLoading).toHaveBeenCalledWith(false);
        expect(storeStub.setLoading).toHaveBeenCalledTimes(1);
        expect(storeStub.setError).not.toHaveBeenCalled();
    });

    it('removeOperator in errore espone errore testo da HttpErrorResponse.error', () => {
        apiStub.removeOperatorFromWard.mockReturnValue(
            throwError(
                () => new HttpErrorResponse({ status: 400, error: 'Operatore non assegnato' })
            )
        );

        let emitted = false;
        service.removeOperator('ward-1', 'user-2').subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(storeStub.setError).toHaveBeenCalledWith('Operatore non assegnato');
        expect(storeStub.setError).toHaveBeenCalledTimes(1);
        expect(apiStub.getWards).not.toHaveBeenCalled();
        expect(storeStub.setWards).not.toHaveBeenCalled();
    });

    it('assignApartment in errore usa HttpErrorResponse.message quando non c e error string', () => {
        apiStub.assignApartmentToWard.mockReturnValue(
            throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' }))
        );

        service.assignApartment('ward-1', { apartmentId: 'apt-2' }).subscribe();

        const messageArg = vi.mocked(storeStub.setError).mock.calls[0]?.[0] as string;
        expect(messageArg.length).toBeGreaterThan(0);
        expect(apiStub.getWards).not.toHaveBeenCalled();
        expect(storeStub.setWards).not.toHaveBeenCalled();
    });

    it('removeApartment in errore non-http usa fallback message', () => {
        apiStub.removeApartmentFromWard.mockReturnValue(throwError(() => ({ bad: true })));

        service.removeApartment('ward-1', 'apt-2').subscribe();

        expect(storeStub.setError).toHaveBeenCalledWith('Operazione di assegnazione non riuscita.');
        expect(storeStub.setError).toHaveBeenCalledTimes(1);
        expect(apiStub.getWards).not.toHaveBeenCalled();
    });
});
