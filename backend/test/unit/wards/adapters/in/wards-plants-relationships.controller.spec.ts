import { Test, TestingModule } from '@nestjs/testing';
import { WardsPlantsRelationshipsController } from 'src/wards/adapters/in/wards-plants-relationships.controller';
import {
  ADD_PLANT_TO_WARD_USE_CASE,
  FIND_ALL_PLANTS_BY_WARD_ID_USE_CASE,
  REMOVE_PLANT_FROM_WARD_USE_CASE,
} from 'src/wards/application/services/wards-plants-relationships.service';
import { UserGuard } from 'src/guard/user/user.guard';
import { AdminGuard } from 'src/guard/admin/admin.guard';
import { JwtService } from '@nestjs/jwt';

describe('WardsPlantsRelationshipsController', () => {
  let controller: WardsPlantsRelationshipsController;

  const mockAddPlantToWardUseCase = {
    addPlantToWard: jest.fn(),
  };

  const mockFindAllPlantsByWardIdUseCase = {
    findAllPlantsByWardId: jest.fn(),
  };

  const mockRemovePlantFromWardUseCase = {
    removePlantFromWard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WardsPlantsRelationshipsController],
      providers: [
        {
          provide: ADD_PLANT_TO_WARD_USE_CASE,
          useValue: mockAddPlantToWardUseCase,
        },
        {
          provide: FIND_ALL_PLANTS_BY_WARD_ID_USE_CASE,
          useValue: mockFindAllPlantsByWardIdUseCase,
        },
        {
          provide: REMOVE_PLANT_FROM_WARD_USE_CASE,
          useValue: mockRemovePlantFromWardUseCase,
        },
        {
          provide: UserGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: AdminGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn().mockReturnValue({ id: 1, role: 'AMMINISTRATORE' }),
          },
        },
      ],
    }).compile();

    controller = module.get<WardsPlantsRelationshipsController>(
      WardsPlantsRelationshipsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call addPlantToWardUseCase.addPlantToWard with correct args', async () => {
    const req = { wardId: 1, plantId: 'id' };
    await controller.addPlantToWard(req);
    expect(mockAddPlantToWardUseCase.addPlantToWard).toHaveBeenCalledWith(
      expect.objectContaining({ wardId: 1, plantId: 'id' }),
    );
  });

  it('should call findAllPlantsByWardIdUseCase.findAllPlantsByWardId with correct args', async () => {
    await controller.findAllPlantsByWardId(1);
    expect(
      mockFindAllPlantsByWardIdUseCase.findAllPlantsByWardId,
    ).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('should call removePlantFromWardUseCase.removePlantFromWard with correct args', async () => {
    await controller.removePlantFromWard('id');
    expect(
      mockRemovePlantFromWardUseCase.removePlantFromWard,
    ).toHaveBeenCalledWith(expect.objectContaining({ plantId: 'id' }));
  });
});
