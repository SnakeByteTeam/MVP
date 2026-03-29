import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import {
  CREATE_USER_USE_CASE,
  DELETE_USER_USE_CASE,
  FIND_ALL_USERS_USE_CASE,
  UPDATE_USER_USE_CASE,
} from '../../application/services/users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: FIND_ALL_USERS_USE_CASE,
          useValue: { findAllUsers: jest.fn() },
        },
        { provide: UPDATE_USER_USE_CASE, useValue: { updateUser: jest.fn() } },
        { provide: CREATE_USER_USE_CASE, useValue: { createUser: jest.fn() } },
        { provide: DELETE_USER_USE_CASE, useValue: { deleteUser: jest.fn() } },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
