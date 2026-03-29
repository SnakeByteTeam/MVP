import { Test, TestingModule } from '@nestjs/testing';
import { WardsController } from './wards.controller';
import { CREATE_WARD_USE_CASE } from '../../application/services/ward.service';

describe('WardsController', () => {
  let controller: WardsController;

  const mockCreateWardUseCase = {
    createWard: jest.fn(),
  };

  const mockFindAllWardUseCase = {
    findAllWards: jest.fn(),
  };

  const mockUpdateWardUseCase = {
    updateWard: jest.fn(),
  };

  const mockDeleteWardUseCase = {
    deleteWard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WardsController],
      providers: [
        { provide: CREATE_WARD_USE_CASE, useValue: mockCreateWardUseCase },
        { provide: 'FIND_ALL_WARD_USE_CASE', useValue: mockFindAllWardUseCase },
        { provide: 'UPDATE_WARD_USE_CASE', useValue: mockUpdateWardUseCase },
        { provide: 'DELETE_WARD_USE_CASE', useValue: mockDeleteWardUseCase },
      ],
    }).compile();

    controller = module.get<WardsController>(WardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createWardUseCase.createWard with correct args', async () => {
    const req = { name: 'Test Ward' };
    await controller.createWard(req);
    expect(mockCreateWardUseCase.createWard).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Ward' }),
    );
  });

  it('should call findAllWardUseCase.findAllWards', async () => {
    await controller.findAllWards();
    expect(mockFindAllWardUseCase.findAllWards).toHaveBeenCalled();
  });

  it('should call updateWardUseCase.updateWard with correct args', async () => {
    const req = { name: 'Updated Ward' };
    await controller.updateWard(1, req);
    expect(mockUpdateWardUseCase.updateWard).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, name: 'Updated Ward' }),
    );
  });

  it('should call deleteWardUseCase.deleteWard with correct args', async () => {
    await controller.deleteWard(1);
    expect(mockDeleteWardUseCase.deleteWard).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
    );
  });
});
