import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { FIND_ALL_USERS_PORT } from '../../adapters/out/find-all-users-adapter';
import { FIND_ALL_AVAILABLE_USERS_PORT } from '../../adapters/out/find-all-available-users-adapter';
import { UPDATE_USER_PORT } from '../../adapters/out/update-user-adapter';
import { CREATE_USER_PORT } from '../../adapters/out/create-user-adapter';
import { DELETE_USER_PORT } from '../../adapters/out/delete-user-adapter';
import { GENERATE_PASSWORD_PORT } from '../../infrastructure/password-generator/generate-password-impl';
import { HASH_PASSWORD_PORT } from '../../infrastructure/hash-password-impl/hash-password-impl';
import { CONVERT_BASE_64_PORT } from '../../infrastructure/convert-base-64-impl/convert-base-64-impl';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: FIND_ALL_USERS_PORT, useValue: { findAllUsers: jest.fn() } },
        {
          provide: FIND_ALL_AVAILABLE_USERS_PORT,
          useValue: { findAllAvailableUsers: jest.fn() },
        },
        { provide: UPDATE_USER_PORT, useValue: { updateUser: jest.fn() } },
        { provide: CREATE_USER_PORT, useValue: { createUser: jest.fn() } },
        { provide: DELETE_USER_PORT, useValue: { deleteUser: jest.fn() } },
        {
          provide: GENERATE_PASSWORD_PORT,
          useValue: { generatePassword: jest.fn() },
        },
        { provide: HASH_PASSWORD_PORT, useValue: { hashPassword: jest.fn() } },
        { provide: CONVERT_BASE_64_PORT, useValue: { toBase64: jest.fn() } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
