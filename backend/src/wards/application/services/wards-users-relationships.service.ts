import { Injectable } from '@nestjs/common';
import { AddUserToWardUseCase } from '../ports/in/add-user-to-ward-use-case.interface';
import { FindAllUsersByWardIdUseCase } from '../ports/in/find-all-users-by-ward-id-use-case.interface';
import { RemoveUserFromWardUseCase } from '../ports/in/remove-user-from-ward-use-case.interface';
import { AddUserToWardCmd } from '../commands/add-user-to-ward-cmd';
import { FindAllUsersByWardIdCmd } from '../commands/find-all-users-by-ward-id-cmd';
import { RemoveUserFromWardCmd } from '../commands/remove-user-from-ward-cmd';

@Injectable()
export class WardsUsersRelationshipsService implements 
    AddUserToWardUseCase, 
    FindAllUsersByWardIdUseCase, 
    RemoveUserFromWardUseCase {

    addUserToWard(req: AddUserToWardCmd) {
        throw new Error('Method not implemented.');
    }
    findAllUsersByWardId(req: FindAllUsersByWardIdCmd) {
        throw new Error('Method not implemented.');
    }
    removeUserFromWard(req: RemoveUserFromWardCmd) {
        throw new Error('Method not implemented.');
    }
}

export const ADD_USER_TO_WARD_USE_CASE = 'ADD_USER_TO_WARD_USE_CASE';
export const FIND_ALL_USERS_BY_WARD_ID_USE_CASE = 'FIND_ALL_USERS_BY_WARD_ID_USE_CASE';
export const REMOVE_USER_FROM_WARD_USE_CASE = 'REMOVE_USER_FROM_WARD_USE_CASE';