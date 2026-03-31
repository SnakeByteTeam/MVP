import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../../core/models/user-role.enum';
import { InternalAuthService } from '../../../core/services/internal-auth.service';
import type { UserSession } from '../../user-auth/models/user-session.model';
import { WardApiService } from '../../ward-management/services/ward-api.service';
import { OperatorAlarmScopeService } from './operator-alarm-scope.service';

describe('OperatorAlarmScopeService', () => {
    let service: OperatorAlarmScopeService;
    let sessionSubject: BehaviorSubject<UserSession | null>;

    const authServiceStub = {
        getCurrentUser$: vi.fn(),
    };

    const wardApiStub = {
        getWards: vi.fn(),
        getOperatorsByWardId: vi.fn(),
        getPlantsByWardId: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        sessionSubject = new BehaviorSubject<UserSession | null>(null);
        authServiceStub.getCurrentUser$.mockReturnValue(sessionSubject.asObservable());

        TestBed.configureTestingModule({
            providers: [
                OperatorAlarmScopeService,
                { provide: InternalAuthService, useValue: authServiceStub },
                { provide: WardApiService, useValue: wardApiStub },
            ],
        });

        service = TestBed.inject(OperatorAlarmScopeService);
    });

    it('ritorna contesto neutro per utenti non OSS', async () => {
        sessionSubject.next({
            userId: '7',
            username: 'admin',
            role: UserRole.AMMINISTRATORE,
            accessToken: 'token',
            isFirstAccess: false,
        });

        const context = await firstValueFrom(service.context$);

        expect(context).toEqual({
            isOperator: false,
            assignedWardIds: [],
            assignedPlantIds: [],
            errorMessage: null,
        });
        expect(wardApiStub.getWards).not.toHaveBeenCalled();
    });

    it('risolve ward e plant assegnati per OSS corrente', async () => {
        sessionSubject.next({
            userId: '10',
            username: 'oss',
            role: UserRole.OPERATORE_SANITARIO,
            accessToken: 'token',
            isFirstAccess: false,
        });

        wardApiStub.getWards.mockReturnValue(of([
            { id: 1, name: 'A' },
            { id: 2, name: 'B' },
        ]));

        wardApiStub.getOperatorsByWardId.mockImplementation((wardId: number) => {
            if (wardId === 1) {
                return of([{ id: 10, username: 'oss' }]);
            }

            return of([{ id: 99, username: 'other' }]);
        });

        wardApiStub.getPlantsByWardId.mockImplementation((wardId: number) => {
            if (wardId === 1) {
                return of([
                    { id: 'apt-1', name: 'Plant A1' },
                    { id: 'apt-2', name: 'Plant A2' },
                ]);
            }

            return of([]);
        });

        const context = await firstValueFrom(service.context$);

        expect(context.isOperator).toBe(true);
        expect(context.assignedWardIds).toEqual([1]);
        expect(context.assignedPlantIds).toEqual(['apt-1', 'apt-2']);
        expect(context.errorMessage).toBeNull();
    });

    it('in caso di errore ritorna fallback con messaggio', async () => {
        sessionSubject.next({
            userId: '10',
            username: 'oss',
            role: UserRole.OPERATORE_SANITARIO,
            accessToken: 'token',
            isFirstAccess: false,
        });

        wardApiStub.getWards.mockReturnValue(throwError(() => new Error('boom')));

        const context = await firstValueFrom(service.context$);

        expect(context.isOperator).toBe(true);
        expect(context.assignedWardIds).toEqual([]);
        expect(context.assignedPlantIds).toEqual([]);
        expect(context.errorMessage).toBe('Impossibile caricare i reparti assegnati.');
    });
});
