import { Test, TestingModule } from '@nestjs/testing';
import { ADD_USER_TO_WARD_PORT } from 'src/wards/application/ports/out/add-user-to-ward-port.interface';
import { FIND_ALL_USERS_BY_WARD_ID_PORT } from 'src/wards/application/ports/out/find-all-users-by-ward-id-port.interface';
import { REMOVE_USER_FROM_WARD_PORT } from 'src/wards/application/ports/out/remove-user-from-ward-port.interface';
import { WardsUsersRelationshipsService } from 'src/wards/application/services/wards-users-relationships.service';

describe('WardsUsersRelationshipsServiceService', () => {
  let service: WardsUsersRelationshipsService;

  const mockAddUserToWard = {
    addUserToWard: jest.fn(),
  };

  const mockFindAllUsersByWardId = {
    findAllUsersByWardId: jest.fn(),
  };

  const mockRemoveUserFromWard = {
    removeUserFromWard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WardsUsersRelationshipsService,
        { provide: ADD_USER_TO_WARD_PORT, useValue: mockAddUserToWard },
        {
          provide: FIND_ALL_USERS_BY_WARD_ID_PORT,
          useValue: mockFindAllUsersByWardId,
        },
        {
          provide: REMOVE_USER_FROM_WARD_PORT,
          useValue: mockRemoveUserFromWard,
        },
      ],
    }).compile();

    service = module.get<WardsUsersRelationshipsService>(
      WardsUsersRelationshipsService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a user to a ward', async () => {
    const addUserToWardCmd = { wardId: 1, userId: 1 };
    const addedUser = { id: 1, name: 'name' };
    mockAddUserToWard.addUserToWard.mockResolvedValue(addedUser);

    const result = await service.addUserToWard(addUserToWardCmd);
    expect(mockAddUserToWard.addUserToWard).toHaveBeenCalledWith(
      addUserToWardCmd,
    );
    expect(result).toEqual(addedUser);
  });

  it('should find all users by ward id', async () => {
    const findAllUsersByWardIdCmd = { id: 1 };
    const users = [{ id: 1, name: 'name' }];
    mockFindAllUsersByWardId.findAllUsersByWardId.mockResolvedValue(users);

    const result = await service.findAllUsersByWardId(findAllUsersByWardIdCmd);
    expect(mockFindAllUsersByWardId.findAllUsersByWardId).toHaveBeenCalledWith(
      findAllUsersByWardIdCmd,
    );
    expect(result).toEqual(users);
  });

  it('should remove a user from a ward', async () => {
    const removeUserFromWardCmd = { wardId: 1, userId: 1 };
    mockRemoveUserFromWard.removeUserFromWard.mockResolvedValue(undefined);

    const result = await service.removeUserFromWard(removeUserFromWardCmd);
    expect(mockRemoveUserFromWard.removeUserFromWard).toHaveBeenCalledWith(
      removeUserFromWardCmd,
    );
    expect(result).toBeUndefined();
  });
});
