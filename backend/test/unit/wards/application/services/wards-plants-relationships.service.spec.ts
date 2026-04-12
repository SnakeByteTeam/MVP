import { Test, TestingModule } from '@nestjs/testing';
import { ADD_PLANT_TO_WARD_PORT } from 'src/wards/application/ports/out/add-plant-to-ward-port.interface';
import { FIND_ALL_PLANTS_BY_WARD_ID_PORT } from 'src/wards/application/ports/out/find-all-plants-by-ward-id-port.interface';
import { REMOVE_PLANT_FROM_WARD_PORT } from 'src/wards/application/ports/out/remove-plant-from-ward-port.interface';
import { WardsPlantsRelationshipsService } from 'src/wards/application/services/wards-plants-relationships.service';

describe('WardsPlantsRelationshipsService', () => {
  let service: WardsPlantsRelationshipsService;

  const mockAddPlantToWard = {
    addPlantToWard: jest.fn(),
  };

  const mockFindAllPlantsByWardId = {
    findAllPlantsByWardId: jest.fn(),
  };

  const mockRemovePlantFromWard = {
    removePlantFromWard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WardsPlantsRelationshipsService,
        { provide: ADD_PLANT_TO_WARD_PORT, useValue: mockAddPlantToWard },
        {
          provide: FIND_ALL_PLANTS_BY_WARD_ID_PORT,
          useValue: mockFindAllPlantsByWardId,
        },
        {
          provide: REMOVE_PLANT_FROM_WARD_PORT,
          useValue: mockRemovePlantFromWard,
        },
      ],
    }).compile();

    service = module.get<WardsPlantsRelationshipsService>(
      WardsPlantsRelationshipsService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a plant to a ward', async () => {
    const addPlantToWardCmd = { wardId: 1, plantId: 'id' };
    const addedPlant = { id: 1, name: 'name' };
    mockAddPlantToWard.addPlantToWard.mockResolvedValue(addedPlant);

    const result = await service.addPlantToWard(addPlantToWardCmd);
    expect(mockAddPlantToWard.addPlantToWard).toHaveBeenCalledWith(
      addPlantToWardCmd,
    );
    expect(result).toEqual(addedPlant);
  });

  it('should find all plants by ward id', async () => {
    const findAllPlantsByWardIdCmd = { id: 1 };
    const plants = [{ id: 1, name: 'name' }];
    mockFindAllPlantsByWardId.findAllPlantsByWardId.mockResolvedValue(plants);

    const result = await service.findAllPlantsByWardId(
      findAllPlantsByWardIdCmd,
    );
    expect(
      mockFindAllPlantsByWardId.findAllPlantsByWardId,
    ).toHaveBeenCalledWith(findAllPlantsByWardIdCmd);
    expect(result).toEqual(plants);
  });

  it('should remove a plant from a ward', async () => {
    const removePlantFromWardCmd = { wardId: 1, plantId: 'id' };
    mockRemovePlantFromWard.removePlantFromWard.mockResolvedValue(undefined);

    const result = await service.removePlantFromWard(removePlantFromWardCmd);
    expect(mockRemovePlantFromWard.removePlantFromWard).toHaveBeenCalledWith(
      removePlantFromWardCmd,
    );
    expect(result).toBeUndefined();
  });
});
