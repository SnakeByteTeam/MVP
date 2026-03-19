import { Controller, Delete, Get, Inject, Param, Post } from '@nestjs/common';
import { AddUserToWardReqDto } from '../../infrastructure/dtos/in/add-user-to-ward-req-dto';
import { AddUserToWardUseCase } from '../../application/ports/in/add-user-to-ward-use-case.interface';
import { FindAllUsersByWardIdUseCase } from '../../application/ports/in/find-all-users-by-ward-id-use-case.interface';
import { RemoveUserFromWardUseCase } from '../../application/ports/in/remove-user-from-ward-use-case.interface';
import { 
    ADD_USER_TO_WARD_USE_CASE, 
    FIND_ALL_USERS_BY_WARD_ID_USE_CASE, 
    REMOVE_USER_FROM_WARD_USE_CASE 
} from '../../application/services/wards-users-relationships.service';
import { AddUserToWardCmd } from '../../application/commands/add-user-to-ward-cmd';
import { FindAllUsersByWardIdCmd } from '../../application/commands/find-all-users-by-ward-id-cmd';
import { RemoveUserFromWardCmd } from '../../application/commands/remove-user-from-ward-cmd';

@Controller('wards-users-relationships')
export class WardsUsersRelationshipsController {

    constructor(
        @Inject(ADD_USER_TO_WARD_USE_CASE) private readonly addUserToWardUseCase: AddUserToWardUseCase,
        @Inject(FIND_ALL_USERS_BY_WARD_ID_USE_CASE) private readonly findAllUsersByWardIdUseCase: FindAllUsersByWardIdUseCase,
        @Inject(REMOVE_USER_FROM_WARD_USE_CASE) private readonly removeUserFromWardUseCase: RemoveUserFromWardUseCase,
    ){}

    @Post()
    addUserToWard(req: AddUserToWardReqDto){
        return this.addUserToWardUseCase.addUserToWard(
            new AddUserToWardCmd(
                req.wardId, 
                req.userId
            )
        );
    }

    @Get('/:wardId')
    async findAllUsersByWardId(@Param('wardId') id: number){
        return this.findAllUsersByWardIdUseCase.findAllUsersByWardId(
            new FindAllUsersByWardIdCmd(
                id
            )
        );
    }

    @Delete('/:wardId/:userId')
    removeUserFromWard(
        @Param('wardId') wardId: number,
        @Param('userId') userId: number
    ){
        return this.removeUserFromWardUseCase.removeUserFromWard(
            new RemoveUserFromWardCmd(
                wardId,
                userId
            )
        );
    }
}
