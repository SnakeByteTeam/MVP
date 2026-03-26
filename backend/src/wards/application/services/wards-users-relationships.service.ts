import { Inject, Injectable } from '@nestjs/common';
import { AddUserToWardUseCase } from '../ports/in/add-user-to-ward-use-case.interface';
import { FindAllUsersByWardIdUseCase } from '../ports/in/find-all-users-by-ward-id-use-case.interface';
import { RemoveUserFromWardUseCase } from '../ports/in/remove-user-from-ward-use-case.interface';
import { AddUserToWardCmd } from '../commands/add-user-to-ward-cmd';
import { FindAllUsersByWardIdCmd } from '../commands/find-all-users-by-ward-id-cmd';
import { RemoveUserFromWardCmd } from '../commands/remove-user-from-ward-cmd';
import { AddUserToWardPort } from '../ports/out/add-user-to-ward-port.interface';
import { ADD_USER_TO_WARD_PORT } from '../../adapters/out/add-user-to-ward-adapter';
import { FIND_ALL_USERS_BY_WARD_ID_PORT } from '../../adapters/out/find-all-users-by-ward-id-adapter';
import { FindAllUsersByWardIdPort } from '../ports/out/find-all-users-by-ward-id-port.interface';
import { REMOVE_USER_FROM_WARD_PORT } from '../../adapters/out/remove-user-from-ward-adapter';
import { RemoveUserFromWardPort } from '../ports/out/remove-user-from-ward-port.interface';
import { User } from '../../domain/user';

@Injectable()
export class WardsUsersRelationshipsService
  implements
    AddUserToWardUseCase,
    FindAllUsersByWardIdUseCase,
    RemoveUserFromWardUseCase
{
  constructor(
    @Inject(ADD_USER_TO_WARD_PORT)
    private readonly addUserToWardAdapter: AddUserToWardPort,
    @Inject(FIND_ALL_USERS_BY_WARD_ID_PORT)
    private readonly findAllUsersByWardIdPort: FindAllUsersByWardIdPort,
    @Inject(REMOVE_USER_FROM_WARD_PORT)
    private readonly removeUserFromWardPort: RemoveUserFromWardPort,
  ) {}

  addUserToWard(req: AddUserToWardCmd): Promise<User> {
    return this.addUserToWardAdapter.addUserToWard(req);
  }
  findAllUsersByWardId(req: FindAllUsersByWardIdCmd): Promise<User[]> {
    return this.findAllUsersByWardIdPort.findAllUsersByWardId(req);
  }
  removeUserFromWard(req: RemoveUserFromWardCmd) {
    return this.removeUserFromWardPort.removeUserFromWard(req);
  }
}

export const ADD_USER_TO_WARD_USE_CASE = 'ADD_USER_TO_WARD_USE_CASE';
export const FIND_ALL_USERS_BY_WARD_ID_USE_CASE =
  'FIND_ALL_USERS_BY_WARD_ID_USE_CASE';
export const REMOVE_USER_FROM_WARD_USE_CASE = 'REMOVE_USER_FROM_WARD_USE_CASE';
