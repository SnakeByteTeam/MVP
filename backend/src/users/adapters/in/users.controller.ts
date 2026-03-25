import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { UpdateUserReqDto } from '../../infrastructure/dtos/in/update-user-req.dto';
import { CreateUserReqDto } from '../../infrastructure/dtos/in/create-user-req.dto';
import {
  CREATE_USER_USE_CASE,
  DELETE_USER_USE_CASE,
  FIND_ALL_USERS_USE_CASE,
  UPDATE_USER_USE_CASE,
} from '../../application/services/users.service';
import { FindAllUsersUseCase } from '../../application/ports/in/find-all-users-use-case.interface';
import { UpdateUserUseCase } from '../../application/ports/in/update-user-use-case.interface';
import { CreateUserUseCase } from '../../application/ports/in/create-user-use-case.interface';
import { DeleteUserUseCase } from '../../application/ports/in/delete-user-use-case.interface';
import { UpdateUserCmd } from '../../application/commands/update-user-cmd';
import { CreateUserCmd } from '../../application/commands/create-user-cmd';
import { DeleteUserCmd } from '../../application/commands/delete-user-cmd';
import { UpdateUserResDto } from '../../infrastructure/dtos/out/update-user-res.dto';
import { CreateUserResDto } from '../../infrastructure/dtos/out/create-user-res.dto';
import { plainToInstance } from 'class-transformer';
import { FindAllUserResDto } from '../../infrastructure/dtos/out/find-all-user-res.dto';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(FIND_ALL_USERS_USE_CASE)
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    @Inject(UPDATE_USER_USE_CASE)
    private readonly updateUserUseCase: UpdateUserUseCase,
    @Inject(CREATE_USER_USE_CASE)
    private readonly createUserUseCase: CreateUserUseCase,
    @Inject(DELETE_USER_USE_CASE)
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get()
  async findAll(): Promise<FindAllUserResDto[]> {
    const users = await this.findAllUsersUseCase.findAllUsers();
    return plainToInstance(FindAllUserResDto, users);
  }

  @Put('/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdateUserReqDto,
  ): Promise<UpdateUserResDto> {
    const user = await this.updateUserUseCase.updateUser(
      new UpdateUserCmd(id, req.username, req.surname, req.name),
    );
    return plainToInstance(UpdateUserResDto, user);
  }

  @Post()
  async createUser(@Body() req: CreateUserReqDto): Promise<CreateUserResDto> {
    const createdUser = await this.createUserUseCase.createUser(
      new CreateUserCmd(req.username, req.surname, req.name),
    );
    return plainToInstance(CreateUserResDto, createdUser);
  }

  @Delete('/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.deleteUserUseCase.deleteUser(new DeleteUserCmd(id));
  }
}
