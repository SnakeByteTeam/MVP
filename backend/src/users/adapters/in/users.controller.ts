import { Body, Controller, Delete, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { UpdateUserReqDto } from '../../infrastructure/dtos/in/update-user-req.dto';
import { CreateUserReqDto } from '../../infrastructure/dtos/in/create-user-req.dto';
import { 
    CREATE_USER_USE_CASE, 
    DELETE_USER_USE_CASE, 
    FIND_ALL_USERS_USE_CASE, 
    UPDATE_USER_USE_CASE 
} from '../../application/services/users.service';
import { FindAllUsersUseCase } from '../../application/ports/in/find-all-users-use-case.interface';
import { UpdateUserUseCase } from '../../application/ports/in/update-user-use-case.interface';
import { CreateUserUseCase } from '../../application/ports/in/create-user-use-case.interface';
import { DeleteUserUseCase } from '../../application/ports/in/delete-user-use-case.interface';
import { UpdateUserCmd } from '../../application/commands/update-user-cmd';
import { CreateUserCmd } from '../../application/commands/create-user-cmd';
import { DeleteUserCmd } from '../../application/commands/delete-user-cmd';

@Controller('users')
export class UsersController {

    constructor(
        @Inject(CREATE_USER_USE_CASE) private readonly findAllUsersUseCase: FindAllUsersUseCase,
        @Inject(DELETE_USER_USE_CASE) private readonly updateUserUseCase: UpdateUserUseCase,
        @Inject(FIND_ALL_USERS_USE_CASE) private readonly createUserUseCase: CreateUserUseCase,
        @Inject(UPDATE_USER_USE_CASE) private readonly deleteUserUseCase: DeleteUserUseCase,
    ){}

    @Get()
    async findAll(){
        return this.findAllUsersUseCase.findAllUsers();
    }

    @Put('/:id')
    async updateUser(
        @Param('id') id: number,
        @Body() updateUserReqDto: UpdateUserReqDto
    ){
        return this.updateUserUseCase.updateUser(
            new UpdateUserCmd(
                id,
                updateUserReqDto.username,
                updateUserReqDto.surname,
                updateUserReqDto.name,
                updateUserReqDto.role
            )
        );
    }

    @Post()
    async createUser(
        @Body() createUserReqDto: CreateUserReqDto
    ){
        return this.createUserUseCase.createUser(
            new CreateUserCmd(
                createUserReqDto.name,
                createUserReqDto.surname,
                createUserReqDto.name,
                createUserReqDto.role,
                createUserReqDto.tempPassword
            )
        );
    }

    @Delete('/:id')
    async deleteUser(
        @Param('id') id: number
    ){
        return this.deleteUserUseCase.deleteUser(
            new DeleteUserCmd(
                id
            )
        );
    }
}
