import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventSubscriptionService } from '../../../core/alarm/services/event-subscription.service';
import { UserRole } from '../../../core/models/user-role.enum';
import type { WardSummaryDto } from '../models/ward-api.dto';
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
        },
    ];

    const wardSummaries: WardSummaryDto[] = [{ id: 1, name: 'Cardiologia' }];

    const apiStub = {
        assignOperatorToWard: vi.fn(),
        removeOperatorFromWard: vi.fn(),
        assignPlantToWard: vi.fn(),
        removePlantFromWard: vi.fn(),
        getAvailableOperators: vi.fn(),
        getAvailablePlants: vi.fn(),
        getWards: vi.fn(),
        getPlantsByWardId: vi.fn(),
        getOperatorsByWardId: vi.fn(),
    };

    const storeStub = {
        setWards: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        getWardsSnapshot: vi.fn(),
    };

    const eventSubscriptionStub = {
        refreshWardRoomSubscription: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        TestBed.configureTestingModule({
            providers: [
                AssignmentOperationsService,
                { provide: WardApiService, useValue: apiStub },
                { provide: WardStore, useValue: storeStub },
                { provide: EventSubscriptionService, useValue: eventSubscriptionStub },
            ],
        });

        service = TestBed.inject(AssignmentOperationsService);
    });

    it('assignOperator esegue operazione e poi ricarica i wards', () => {
        storeStub.getWardsSnapshot.mockReturnValue([]);
        apiStub.assignOperatorToWard.mockReturnValue(of(void 0));
        apiStub.getWards.mockReturnValue(of(wardSummaries));
        apiStub.getPlantsByWardId.mockReturnValue(of([{ id: '101', name: 'App. 101' }]));
        apiStub.getOperatorsByWardId.mockReturnValue(of([{ id: 1, username: 'mrossi' }]));

        service.assignOperator(1, { userId: 2 }).subscribe((result) => {
            expect(result).toBeUndefined();
        });

        expect(apiStub.assignOperatorToWard).toHaveBeenCalledWith(1, { userId: 2 });
        expect(apiStub.getWards).toHaveBeenCalledOnce();
        expect(apiStub.getPlantsByWardId).toHaveBeenCalledWith(1);
        expect(apiStub.getOperatorsByWardId).toHaveBeenCalledWith(1);
        expect(storeStub.setWards).toHaveBeenCalledWith(wards);
        expect(storeStub.setWards).toHaveBeenCalledTimes(1);
        expect(storeStub.setLoading).toHaveBeenCalledWith(false);
        expect(storeStub.setLoading).toHaveBeenCalledTimes(1);
        expect(eventSubscriptionStub.refreshWardRoomSubscription).toHaveBeenCalledTimes(1);
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

    it('getAvailablePlantsForWard filtra i plant gia assegnati in qualunque ward', () => {
        storeStub.getWardsSnapshot.mockReturnValue([
            {
                id: 10,
                name: 'W1',
                apartments: [{ id: '201', name: 'App. 201' }],
                operators: [],
            },
            {
                id: 11,
                name: 'W2',
                apartments: [{ id: '202', name: 'App. 202' }],
                operators: [],
            },
        ]);
        apiStub.getAvailablePlants.mockReturnValue(
            of([
                { id: '201', name: 'App. 201' },
                { id: '202', name: 'App. 202' },
                { id: '203', name: 'App. 203' },
            ]),
        );

        service.getAvailablePlantsForWard(10).subscribe((result) => {
            expect(result).toEqual([{ id: '203', name: 'App. 203' }]);
        });

        expect(apiStub.getAvailablePlants).toHaveBeenCalledOnce();
    });

    it('getAvailableUsersForWard filtra solo gli utenti gia assegnati nel ward corrente', () => {
        storeStub.getWardsSnapshot.mockReturnValue([
            {
                id: 10,
                name: 'W1',
                apartments: [],
                operators: [{ id: 1, firstName: 'mrossi', lastName: '', username: 'mrossi', role: UserRole.OPERATORE_SANITARIO }],
            },
            {
                id: 11,
                name: 'W2',
                apartments: [],
                operators: [{ id: 2, firstName: 'lverdi', lastName: '', username: 'lverdi', role: UserRole.OPERATORE_SANITARIO }],
            },
        ]);
        apiStub.getAvailableOperators.mockReturnValue(
            of([
                { id: 1, username: 'mrossi' },
                { id: 2, username: 'lverdi' },
                { id: 3, username: 'gbianchi' },
            ]),
        );

        service.getAvailableUsersForWard(10).subscribe((result) => {
            expect(result).toEqual([
                {
                    id: 2,
                    firstName: 'lverdi',
                    lastName: '',
                    username: 'lverdi',
                    role: UserRole.OPERATORE_SANITARIO,
                },
                {
                    id: 3,
                    firstName: 'gbianchi',
                    lastName: '',
                    username: 'gbianchi',
                    role: UserRole.OPERATORE_SANITARIO,
                },
            ]);
        });

        expect(apiStub.getAvailableOperators).toHaveBeenCalledOnce();
    });

    it('dopo rimozione un appartamento torna disponibile', () => {
        storeStub.getWardsSnapshot
            .mockReturnValueOnce([
                {
                    id: 10,
                    name: 'W1',
                    apartments: [{ id: '201', name: 'App. 201' }],
                    operators: [],
                },
            ])
            .mockReturnValueOnce([
                {
                    id: 10,
                    name: 'W1',
                    apartments: [],
                    operators: [],
                },
            ]);

        apiStub.getAvailablePlants.mockReturnValue(
            of([
                { id: '201', name: 'App. 201' },
                { id: '202', name: 'App. 202' },
            ]),
        );

        service.getAvailablePlantsForWard(10).subscribe((result) => {
            expect(result).toEqual([{ id: '202', name: 'App. 202' }]);
        });

        service.getAvailablePlantsForWard(10).subscribe((result) => {
            expect(result).toEqual([
                { id: '201', name: 'App. 201' },
                { id: '202', name: 'App. 202' },
            ]);
        });
    });

    it('dopo eliminazione reparto, gli appartamenti del reparto eliminato tornano disponibili', () => {
        storeStub.getWardsSnapshot
            .mockReturnValueOnce([
                {
                    id: 10,
                    name: 'W1',
                    apartments: [{ id: '201', name: 'App. 201' }],
                    operators: [],
                },
                {
                    id: 11,
                    name: 'W2',
                    apartments: [{ id: '202', name: 'App. 202' }],
                    operators: [],
                },
            ])
            .mockReturnValueOnce([
                {
                    id: 11,
                    name: 'W2',
                    apartments: [{ id: '202', name: 'App. 202' }],
                    operators: [],
                },
            ]);

        apiStub.getAvailablePlants.mockReturnValue(
            of([
                { id: '201', name: 'App. 201' },
                { id: '202', name: 'App. 202' },
                { id: '203', name: 'App. 203' },
            ]),
        );

        service.getAvailablePlantsForWard(11).subscribe((result) => {
            expect(result).toEqual([{ id: '203', name: 'App. 203' }]);
        });

        service.getAvailablePlantsForWard(11).subscribe((result) => {
            expect(result).toEqual([
                { id: '201', name: 'App. 201' },
                { id: '203', name: 'App. 203' },
            ]);
        });
    });

    it('dopo rimozione un operatore torna disponibile', () => {
        storeStub.getWardsSnapshot
            .mockReturnValueOnce([
                {
                    id: 10,
                    name: 'W1',
                    apartments: [],
                    operators: [
                        {
                            id: 1,
                            firstName: 'mrossi',
                            lastName: '',
                            username: 'mrossi',
                            role: UserRole.OPERATORE_SANITARIO,
                        },
                    ],
                },
            ])
            .mockReturnValueOnce([
                {
                    id: 10,
                    name: 'W1',
                    apartments: [],
                    operators: [],
                },
            ]);

        apiStub.getAvailableOperators.mockReturnValue(
            of([
                { id: 1, username: 'mrossi' },
                { id: 2, username: 'lverdi' },
            ]),
        );

        service.getAvailableUsersForWard(10).subscribe((result) => {
            expect(result).toEqual([
                {
                    id: 2,
                    firstName: 'lverdi',
                    lastName: '',
                    username: 'lverdi',
                    role: UserRole.OPERATORE_SANITARIO,
                },
            ]);
        });

        service.getAvailableUsersForWard(10).subscribe((result) => {
            expect(result).toEqual([
                {
                    id: 1,
                    firstName: 'mrossi',
                    lastName: '',
                    username: 'mrossi',
                    role: UserRole.OPERATORE_SANITARIO,
                },
                {
                    id: 2,
                    firstName: 'lverdi',
                    lastName: '',
                    username: 'lverdi',
                    role: UserRole.OPERATORE_SANITARIO,
                },
            ]);
        });
    });

    it('assignPlant in errore usa HttpErrorResponse.message quando non c e error string', () => {
        apiStub.assignPlantToWard.mockReturnValue(
            throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' }))
        );

        service.assignPlant(1, { plantId: '102' }).subscribe();

        const messageArg = vi.mocked(storeStub.setError).mock.calls[0]?.[0] as string;
        expect(messageArg.length).toBeGreaterThan(0);
        expect(apiStub.getWards).not.toHaveBeenCalled();
        expect(storeStub.setWards).not.toHaveBeenCalled();
    });

    it('removePlant in errore non-http usa fallback message', () => {
        apiStub.removePlantFromWard.mockReturnValue(throwError(() => ({ bad: true })));

        service.removePlant('102').subscribe();

        expect(storeStub.setError).toHaveBeenCalledWith('Operazione di assegnazione non riuscita.');
        expect(storeStub.setError).toHaveBeenCalledTimes(1);
        expect(apiStub.getWards).not.toHaveBeenCalled();
    });
});
