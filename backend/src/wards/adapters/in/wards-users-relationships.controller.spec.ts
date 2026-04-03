import { Test, TestingModule } from '@nestjs/testing';
import { WardsUsersRelationshipsController } from './wards-users-relationships.controller';
import {
  ADD_USER_TO_WARD_USE_CASE,
  FIND_ALL_USERS_BY_WARD_ID_USE_CASE,
  REMOVE_USER_FROM_WARD_USE_CASE,
} from '../../application/services/wards-users-relationships.service';

describe('WardsUsersRelationshipsController', () => {
  let controller: WardsUsersRelationshipsController;

  const mockAddUserToWardUseCase = {
    addUserToWard: jest.fn(),
  };

  const mockFindAllUsersByWardIdUseCase = {
    findAllUsersByWardId: jest.fn(),
  };

  const mockRemoveUserFromWardUseCase = {
    removeUserFromWard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WardsUsersRelationshipsController],
      providers: [
        {
          provide: ADD_USER_TO_WARD_USE_CASE,
          useValue: mockAddUserToWardUseCase,
        },
        {
          provide: REMOVE_USER_FROM_WARD_USE_CASE,
          useValue: mockRemoveUserFromWardUseCase,
        },
        {
          provide: FIND_ALL_USERS_BY_WARD_ID_USE_CASE,
          useValue: mockFindAllUsersByWardIdUseCase,
        },
      ],
    }).compile();

    controller = module.get<WardsUsersRelationshipsController>(
      WardsUsersRelationshipsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call addUserToWardUseCase.addUserToWard with correct args', async () => {
    const req = { wardId: 1, userId: 1 };
    await controller.addUserToWard(req);
    expect(mockAddUserToWardUseCase.addUserToWard).toHaveBeenCalledWith(
      expect.objectContaining({ wardId: 1, userId: 1 }),
    );
  });

  it('should call findAllUsersByWardIdUseCase.findAllUsersByWardId with correct args', async () => {
    await controller.findAllUsersByWardId(1);
    expect(
      mockFindAllUsersByWardIdUseCase.findAllUsersByWardId,
    ).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('should call removeUserFromWardUseCase.removeUserFromWard with correct args', async () => {
    await controller.removeUserFromWard(1, 1);
    expect(
      mockRemoveUserFromWardUseCase.removeUserFromWard,
    ).toHaveBeenCalledWith(expect.objectContaining({ wardId: 1, userId: 1 }));
  });
});
