import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CREATE_USER_PORT } from '../../adapters/out/create-user-adapter';
import { FIND_ALL_USERS_PORT } from '../../adapters/out/find-all-users-adapter';
import { FIND_ALL_AVAILABLE_USERS_PORT } from '../../adapters/out/find-all-available-users-adapter';
import { DELETE_USER_PORT } from '../../adapters/out/delete-user-adapter';
import { UPDATE_USER_PORT } from '../../adapters/out/update-user-adapter';
import { CONVERT_BASE_64_PORT } from '../../infrastructure/convert-base-64-impl/convert-base-64-impl';
import { HASH_PASSWORD_PORT } from '../../infrastructure/hash-password-impl/hash-password-impl';
import { GENERATE_PASSWORD_PORT } from '../../infrastructure/password-generator/generate-password-impl';

describe('UsersService', () => {
  let service: UsersService;

  const mockCreateUser = {
    createUser: jest.fn(),
  }

  const mockFindAllUsers = {
    findAllUsers: jest.fn(),
  }
  
  const mockFindAllAvailableUsers = {
    findAllAvailableUsers: jest.fn(),
  }

  const mockUpdateUser = {
    updateUser: jest.fn(),
  };

  const mockDeleteUser = {
    deleteUser: jest.fn(),
  };

  const mockGeneratePassword = {
    generatePassword: jest.fn(),
  };

  const mockHashPassword = {
    hashPassword: jest.fn(),
  };

  const mockConvertBase64 = {
    toBase64: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: CREATE_USER_PORT, useValue: mockCreateUser },
        { provide: FIND_ALL_USERS_PORT, useValue: mockFindAllUsers },
        { provide: FIND_ALL_AVAILABLE_USERS_PORT, useValue: mockFindAllAvailableUsers },
        { provide: UPDATE_USER_PORT, useValue: mockUpdateUser },
        { provide: DELETE_USER_PORT, useValue: mockDeleteUser },
        { provide: GENERATE_PASSWORD_PORT, useValue: mockGeneratePassword },
        { provide: HASH_PASSWORD_PORT, useValue: mockHashPassword },
        { provide: CONVERT_BASE_64_PORT, useValue: mockConvertBase64 },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call createUserPort.createUser with correct args', async () => {
    const cmd = { username: "username", surname: "surname", name: "name" };
    mockGeneratePassword.generatePassword.mockReturnValue('tempPassword');
    mockHashPassword.hashPassword.mockReturnValue('hashedTempPassword');
    mockCreateUser.createUser.mockResolvedValue({
      id: 1,
      username: 'username',
      surname: 'surname',
      name: 'name',
      role: 'user',
    });
    mockConvertBase64.toBase64.mockReturnValue('base64TempPassword');

    await service.createUser(cmd);

    expect(mockCreateUser.createUser).toHaveBeenCalledWith({
      username: 'username',
      surname: 'surname',
      name: 'name',
      tempPassword: 'hashedTempPassword',
    });
  });

  it('should call findAllUsersPort.findAllUsers', async () => {
    await service.findAllUsers();
    expect(mockFindAllUsers.findAllUsers).toHaveBeenCalled();
  });

  it('should call findAllAvailableUsersPort.findAllAvailableUsers', async () => {
    await service.findAllAvailableUsers();
    expect(mockFindAllAvailableUsers.findAllAvailableUsers).toHaveBeenCalled();
  });

  it('should call updateUserPort.updateUser with correct args', async () => {
    const cmd = { id: 1, username: "username", surname: "surname", name: "name" };
    await service.updateUser(cmd);
    expect(mockUpdateUser.updateUser).toHaveBeenCalledWith(cmd);
  });

  it('should call deleteUserPort.deleteUser with correct args', async () => {
    const cmd = { id: 1 };
    await service.deleteUser(cmd);
    expect(mockDeleteUser.deleteUser).toHaveBeenCalledWith(cmd);
  });
});
