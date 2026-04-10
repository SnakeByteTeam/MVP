import { Test, TestingModule } from '@nestjs/testing';
import { CREATE_WARD_PORT } from 'src/wards/adapters/out/create-ward-adapter';
import { DELETE_WARD_PORT } from 'src/wards/adapters/out/delete-ward-adapter';
import { FIND_ALL_WARDS_PORT } from 'src/wards/adapters/out/find-all-wards-adapter';
import { UPDATE_WARD_PORT } from 'src/wards/adapters/out/update-ward-adapter';
import { WardService } from 'src/wards/application/services/ward.service';

describe('WardService', () => {
  let service: WardService;

  const mockCreateWard = {
    createWard: jest.fn(),
  };

  const mockFindAllWards = {
    findAllWards: jest.fn(),
  };

  const mockUpdateWard = {
    updateWard: jest.fn(),
  };

  const mockDeleteWard = {
    deleteWard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WardService,
        { provide: CREATE_WARD_PORT, useValue: mockCreateWard },
        { provide: FIND_ALL_WARDS_PORT, useValue: mockFindAllWards },
        { provide: UPDATE_WARD_PORT, useValue: mockUpdateWard },
        { provide: DELETE_WARD_PORT, useValue: mockDeleteWard },
      ],
    }).compile();

    service = module.get<WardService>(WardService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a ward', async () => {
    const createWardCmd = { name: 'Test Ward' };
    const createdWard = { id: 1, name: 'Test Ward' };
    mockCreateWard.createWard.mockResolvedValue(createdWard);

    const result = await service.createWard(createWardCmd);
    expect(mockCreateWard.createWard).toHaveBeenCalledWith(createWardCmd);
    expect(result).toEqual(createdWard);
  });

  it('should find all wards', async () => {
    const wards = [{ id: 1, name: 'Test Ward' }];
    mockFindAllWards.findAllWards.mockResolvedValue(wards);

    const result = await service.findAllWards();
    expect(mockFindAllWards.findAllWards).toHaveBeenCalled();
    expect(result).toEqual(wards);
  });

  it('should update a ward', async () => {
    const updateWardCmd = { id: 1, name: 'Updated Ward' };
    const updatedWard = { id: 1, name: 'Updated Ward' };
    mockUpdateWard.updateWard.mockResolvedValue(updatedWard);

    const result = await service.updateWard(updateWardCmd);
    expect(mockUpdateWard.updateWard).toHaveBeenCalledWith(updateWardCmd);
    expect(result).toEqual(updatedWard);
  });

  it('should delete a ward', async () => {
    const deleteWardCmd = { id: 1 };
    mockDeleteWard.deleteWard.mockResolvedValue(undefined);

    await service.deleteWard(deleteWardCmd);
    expect(mockDeleteWard.deleteWard).toHaveBeenCalledWith(deleteWardCmd);
  });
});
