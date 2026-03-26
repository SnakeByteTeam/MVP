import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../../core/models/user-role.enum';
import type { Ward } from '../models/ward.model';
import { AssignmentOperationsService } from './assignment-operations.service';
import { WardApiService } from './ward-api.service';
import { WardStore } from './ward.store';

describe('AssignmentOperationsService', () => {
    let service: AssignmentOperationsService;

    const wards: Ward[] = [
        {
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
        },
    ];

    const apiStub = {
        assignOperatorToWard: vi.fn(),
        removeOperatorFromWard: vi.fn(),
        assignPlantToWard: vi.fn(),
        removePlantFromWard: vi.fn(),
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
                { provide: WardApiService, useValue: apiStub },
                { provide: WardStore, useValue: storeStub },
            ],
        });

        service = TestBed.inject(AssignmentOperationsService);
    });

    it('assignOperator esegue operazione e poi ricarica i wards', () => {
        apiStub.assignOperatorToWard.mockReturnValue(of(void 0));
        apiStub.getWards.mockReturnValue(of(wards));

        service.assignOperator(1, { userId: 2 }).subscribe((result) => {
            expect(result).toBeUndefined();
        });

        expect(apiStub.assignOperatorToWard).toHaveBeenCalledWith(1, { userId: 2 });
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
        service.removeOperator(1, 2).subscribe(() => {
            emitted = true;
        });

        expect(emitted).toBe(false);
        expect(storeStub.setError).toHaveBeenCalledWith('Operatore non assegnato');
        expect(storeStub.setError).toHaveBeenCalledTimes(1);
        expect(apiStub.getWards).not.toHaveBeenCalled();
        expect(storeStub.setWards).not.toHaveBeenCalled();
    });

    it('assignPlant in errore usa HttpErrorResponse.message quando non c e error string', () => {
        apiStub.assignPlantToWard.mockReturnValue(
            throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' }))
        );

        service.assignPlant(1, { plantId: 102 }).subscribe();

        const messageArg = vi.mocked(storeStub.setError).mock.calls[0]?.[0] as string;
        expect(messageArg.length).toBeGreaterThan(0);
        expect(apiStub.getWards).not.toHaveBeenCalled();
        expect(storeStub.setWards).not.toHaveBeenCalled();
    });

    it('removePlant in errore non-http usa fallback message', () => {
        apiStub.removePlantFromWard.mockReturnValue(throwError(() => ({ bad: true })));

        service.removePlant(1, 102).subscribe();

        expect(storeStub.setError).toHaveBeenCalledWith('Operazione di assegnazione non riuscita.');
        expect(storeStub.setError).toHaveBeenCalledTimes(1);
        expect(apiStub.getWards).not.toHaveBeenCalled();
    });
});
