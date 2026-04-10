import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../user-management/models/user-role.enum';
import { WardApiService } from './ward-api.service';
import { WardHydrationService } from './ward-hydration.service';

describe('WardHydrationService', () => {
  let service: WardHydrationService;

  const apiStub = {
    getWards: vi.fn(),
    getPlantsByWardId: vi.fn(),
    getOperatorsByWardId: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        WardHydrationService,
        { provide: WardApiService, useValue: apiStub },
      ],
    });

    service = TestBed.inject(WardHydrationService);
  });

  it('hydrateWardSummaries ritorna array vuoto senza chiamare API relazionali', () => {
    service.hydrateWardSummaries([]).subscribe((result) => {
      expect(result).toEqual([]);
    });

    expect(apiStub.getPlantsByWardId).not.toHaveBeenCalled();
    expect(apiStub.getOperatorsByWardId).not.toHaveBeenCalled();
  });

  it('loadHydratedWards idrata reparti con apartments e operators', () => {
    apiStub.getWards.mockReturnValue(of([{ id: 1, name: 'Cardiologia' }]));
    apiStub.getPlantsByWardId.mockReturnValue(of([{ id: '101', name: 'App. 101' }]));
    apiStub.getOperatorsByWardId.mockReturnValue(of([{ id: 1, username: 'mrossi' }]));

    service.loadHydratedWards().subscribe((result) => {
      expect(result).toEqual([
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
      ]);
    });

    expect(apiStub.getWards).toHaveBeenCalledOnce();
    expect(apiStub.getPlantsByWardId).toHaveBeenCalledWith(1);
    expect(apiStub.getOperatorsByWardId).toHaveBeenCalledWith(1);
  });

  it('mapApartments e mapOperators mantengono mapping coerente', () => {
    expect(service.mapApartments([{ id: '102', name: 'App. 102' }])).toEqual([
      { id: '102', name: 'App. 102' },
    ]);

    expect(service.mapOperators([{ id: 2, username: 'lverdi' }])).toEqual([
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