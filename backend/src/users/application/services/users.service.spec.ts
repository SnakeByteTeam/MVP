import { TestingModule, Test } from '@nestjs/testing';
import { CONVERT_BASE_64_PORT } from '../../infrastructure/convert-base-64-impl/convert-base-64-impl';
import { HASH_PASSWORD_PORT } from '../../infrastructure/hash-password-impl/hash-password-impl';
import { GENERATE_PASSWORD_PORT } from '../../infrastructure/password-generator/generate-password-impl';
import { CREATE_USER_PORT } from '../ports/out/create-user-port.interface';
import { DELETE_USER_PORT } from '../ports/out/delete-user-port.interface';
import { FIND_ALL_AVAILABLE_USERS_PORT } from '../ports/out/find-all-available-users-port.interface';
import { FIND_ALL_USERS_PORT } from '../ports/out/find-all-users-port.interface';
import { UPDATE_USER_PORT } from '../ports/out/update-user-port.interface';
import { UsersService } from './users.service';
import { FIND_USER_BY_ID_PORT } from '../ports/out/find-user-by-id-port.interface';

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
    const cmd = { username: 'username', surname: 'surname', name: 'name' };
    mockGeneratePassword.generatePassword.mockReturnValue('tempPassword');
    mockHashPassword.hashPassword.mockReturnValue('hashedTempPassword');
    mockUserRepository.createUser.mockResolvedValue({
      id: 1,
      username: 'username',
      surname: 'surname',
      name: 'name',
      role: 'user',
    });
    mockConvertBase64.toBase64.mockReturnValue('base64TempPassword');

    await service.createUser(cmd);

    expect(mockUserRepository.createUser).toHaveBeenCalledWith({
      username: 'username',
      surname: 'surname',
      name: 'name',
      tempPassword: 'hashedTempPassword',
    });
  });

  it('should call findAllUsersPort.findAllUsers', async () => {
    await service.findAllUsers();
    expect(mockUserRepository.findAllUsers).toHaveBeenCalled();
  });

  it('should call findAllAvailableUsersPort.findAllAvailableUsers', async () => {
    await service.findAllAvailableUsers();
    expect(mockUserRepository.findAllAvailableUsers).toHaveBeenCalled();
  });

  it('should call findUserByIdPort.findUserById', async () => {
    const cmd = {
      id: 1,
    };
    await service.findUserById(cmd);
    expect(mockUserRepository.findUserById).toHaveBeenCalled();
  });

  it('should call updateUserPort.updateUser with correct args', async () => {
    const cmd = {
      id: 1,
      username: 'username',
      surname: 'surname',
      name: 'name',
    };
    await service.updateUser(cmd);
    expect(mockUserRepository.updateUser).toHaveBeenCalledWith(cmd);
  });

  it('should call deleteUserPort.deleteUser with correct args', async () => {
    const cmd = { id: 1 };
    await service.deleteUser(cmd);
    expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(cmd);
  });
});
