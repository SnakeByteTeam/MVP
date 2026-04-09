import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import {
  CREATE_USER_USE_CASE,
  DELETE_USER_USE_CASE,
  FIND_ALL_AVAILABLE_USERS_USE_CASE,
  FIND_ALL_USERS_USE_CASE,
  FIND_USER_BY_ID_USE_CASE,
  UPDATE_USER_USE_CASE,
} from '../../application/services/users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockFindAllUsersUseCase = {
    findAllUsers: jest.fn(),
  };

  const mockFindAllAvailableUsersUseCase = {
    findAllAvailableUsers: jest.fn(),
  };

  const mockFindUserByIdUseCase = {
    findUserById: jest.fn(),
  };

  const mockUpdateUserUseCase = {
    updateUser: jest.fn(),
  };

  const mockCreateUserUseCase = {
    createUser: jest.fn(),
  };

  const mockDeleteUserUseCase = {
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: FIND_ALL_USERS_USE_CASE,
          useValue: mockFindAllUsersUseCase,
        },
        {
          provide: FIND_ALL_AVAILABLE_USERS_USE_CASE,
          useValue: mockFindAllAvailableUsersUseCase,
        },
        {
          provide: FIND_USER_BY_ID_USE_CASE,
          useValue: mockFindUserByIdUseCase,
        },
        { provide: UPDATE_USER_USE_CASE, useValue: mockUpdateUserUseCase },
        { provide: CREATE_USER_USE_CASE, useValue: mockCreateUserUseCase },
        { provide: DELETE_USER_USE_CASE, useValue: mockDeleteUserUseCase },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAllUsersUseCase.findAllUsers', async () => {
    await controller.findAllUsers();
    expect(mockFindAllUsersUseCase.findAllUsers).toHaveBeenCalled();
  });

  it('should call findAllAvailableUsersUseCase.findAllAvailableUsers', async () => {
    await controller.findAllAvailableUsers();
    expect(
      mockFindAllAvailableUsersUseCase.findAllAvailableUsers,
    ).toHaveBeenCalled();
  });

  it('should call findUserByIdUseCase.findUserById', async () => {
    await controller.findUserById(1);
    expect(
      mockFindAllAvailableUsersUseCase.findAllAvailableUsers,
    ).toHaveBeenCalled();
  });

  it('should call updateUserUseCase.updateUser with correct args', async () => {
    const req = { username: 'username', surname: 'surname', name: 'name' };
    await controller.updateUser(1, req);
    expect(mockUpdateUserUseCase.updateUser).toHaveBeenCalledWith({
      id: 1,
      username: 'username',
      surname: 'surname',
      name: 'name',
    });
  });

  it('should call createUserUseCase.createUser with correct args', async () => {
    const req = { username: 'username', surname: 'surname', name: 'name' };
    await controller.createUser(req);
    expect(mockCreateUserUseCase.createUser).toHaveBeenCalledWith({
      username: 'username',
      surname: 'surname',
      name: 'name',
    });
  });

  it('should call deleteUserUseCase.deleteUser with correct args', async () => {
    await controller.deleteUser(1);
    expect(mockDeleteUserUseCase.deleteUser).toHaveBeenCalledWith({ id: 1 });
  });
});
