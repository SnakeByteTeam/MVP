import { TestingModule, Test } from '@nestjs/testing';
import { UsersService } from 'src/users/application/services/users.service';

import { CONVERT_BASE_64_PORT } from 'src/users/infrastructure/convert-base-64-impl/convert-base-64-impl';
import { HASH_PASSWORD_PORT } from 'src/users/infrastructure/hash-password-impl/hash-password-impl';
import { GENERATE_PASSWORD_PORT } from 'src/users/infrastructure/password-generator/generate-password-impl';

import { CREATE_USER_PORT } from 'src/users/application/ports/out/create-user-port.interface';
import { DELETE_USER_PORT } from 'src/users/application/ports/out/delete-user-port.interface';
import { FIND_ALL_AVAILABLE_USERS_PORT } from 'src/users/application/ports/out/find-all-available-users-port.interface';
import { FIND_ALL_USERS_PORT } from 'src/users/application/ports/out/find-all-users-port.interface';
import { UPDATE_USER_PORT } from 'src/users/application/ports/out/update-user-port.interface';
import { FIND_USER_BY_ID_PORT } from 'src/users/application/ports/out/find-user-by-id-port.interface';

import { User } from 'src/users/domain/user';
import { CreateUserCmd } from 'src/users/application/commands/create-user-cmd';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    createUser: jest.fn(),
    findAllUsers: jest.fn(),
    findAllAvailableUsers: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    findUserById: jest.fn(),
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
        { provide: CREATE_USER_PORT, useValue: mockUserRepository },
        { provide: FIND_ALL_USERS_PORT, useValue: mockUserRepository },
        { provide: FIND_USER_BY_ID_PORT, useValue: mockUserRepository },
        {
          provide: FIND_ALL_AVAILABLE_USERS_PORT,
          useValue: mockUserRepository,
        },
        { provide: UPDATE_USER_PORT, useValue: mockUserRepository },
        { provide: DELETE_USER_PORT, useValue: mockUserRepository },
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
    const cmd = new CreateUserCmd('username', 'surname', 'name');

    mockGeneratePassword.generatePassword.mockReturnValue('tempPassword');
    mockHashPassword.hashPassword.mockReturnValue('hashedTempPassword');

    mockUserRepository.createUser.mockResolvedValue(
      new User(1, 'username', 'surname', 'name', 'user'),
    );

    mockConvertBase64.toBase64.mockReturnValue('base64TempPassword');

    const result = await service.createUser(cmd);

    expect(mockUserRepository.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'username',
        surname: 'surname',
        name: 'name',
        tempPassword: 'hashedTempPassword',
      }),
    );

    expect(result).toBeDefined();
    expect(result.getId()).toBe(1);
    expect(result.getUsername()).toBe('username');
    expect(result.getTempPassword()).toBe('base64TempPassword');
  });

  it('should call findAllUsersPort.findAllUsers', async () => {
    mockUserRepository.findAllUsers.mockResolvedValue([
      new User(1, 'username', 'surname', 'name', 'user'),
    ]);

    const result = await service.findAllUsers();

    expect(mockUserRepository.findAllUsers).toHaveBeenCalled();
    expect(result.length).toBe(1);
  });

  it('should call findAllAvailableUsersPort.findAllAvailableUsers', async () => {
    mockUserRepository.findAllAvailableUsers.mockResolvedValue([
      new User(1, 'username', 'surname', 'name', 'user'),
    ]);

    const result = await service.findAllAvailableUsers();

    expect(mockUserRepository.findAllAvailableUsers).toHaveBeenCalled();
    expect(result.length).toBe(1);
  });

  it('should call findUserByIdPort.findUserById', async () => {
    const cmd = { id: 1 };

    mockUserRepository.findUserById.mockResolvedValue(
      new User(1, 'username', 'surname', 'name', 'user'),
    );

    const result = await service.findUserById(cmd);

    expect(mockUserRepository.findUserById).toHaveBeenCalledWith(cmd);
    expect(result?.getId()).toBe(1);
  });

  it('should call updateUserPort.updateUser with correct args', async () => {
    const cmd = {
      id: 1,
      username: 'username',
      surname: 'surname',
      name: 'name',
    };

    mockUserRepository.updateUser.mockResolvedValue(
      new User(1, 'username', 'surname', 'name', 'user'),
    );

    const result = await service.updateUser(cmd);

    expect(mockUserRepository.updateUser).toHaveBeenCalledWith(cmd);
    expect(result.getId()).toBe(1);
  });

  it('should call deleteUserPort.deleteUser with correct args', async () => {
    const cmd = { id: 1 };

    await service.deleteUser(cmd);

    expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(cmd);
  });
});