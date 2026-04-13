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
  UseGuards,
} from '@nestjs/common';
import { UpdateUserReqDto } from '../../infrastructure/dtos/in/update-user-req.dto';
import { CreateUserReqDto } from '../../infrastructure/dtos/in/create-user-req.dto';
import {
  CREATE_USER_USE_CASE,
  DELETE_USER_USE_CASE,
  FIND_ALL_AVAILABLE_USERS_USE_CASE,
  FIND_ALL_USERS_USE_CASE,
  FIND_USER_BY_ID_USE_CASE,
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
import { FindAllAvailableUsersUseCase } from '../../application/ports/in/find-all-available-users-use-case.interface';
import { FindAllAvailableUsersResDto } from '../../infrastructure/dtos/out/find-all-available-users-res-dto';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { FindUserByIdUseCase } from '../../application/ports/in/find-user-by-id-use-case.interface';
import { FindUserByIdCmd } from '../../application/commands/find-user-by-id-cmd';
import { FindUserByIdResDto } from '../../infrastructure/dtos/out/find-user-by-id-res-dto';
import { UserGuard } from 'src/guard/user/user.guard';
import { AdminGuard } from 'src/guard/admin/admin.guard';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(FIND_ALL_USERS_USE_CASE)
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    @Inject(FIND_USER_BY_ID_USE_CASE)
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    @Inject(FIND_ALL_AVAILABLE_USERS_USE_CASE)
    private readonly findAllAvailableUsersUseCase: FindAllAvailableUsersUseCase,
    @Inject(UPDATE_USER_USE_CASE)
    private readonly updateUserUseCase: UpdateUserUseCase,
    @Inject(CREATE_USER_USE_CASE)
    private readonly createUserUseCase: CreateUserUseCase,
    @Inject(DELETE_USER_USE_CASE)
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @ApiOkResponse({ type: FindAllUserResDto, isArray: true })
  @ApiBearerAuth('access-token')
  @UseGuards(UserGuard, AdminGuard)
  @Get()
  async findAllUsers(): Promise<FindAllUserResDto[]> {
    const users = await this.findAllUsersUseCase.findAllUsers();
    return plainToInstance(FindAllUserResDto, users);
  }

  @ApiOkResponse({ type: FindAllAvailableUsersResDto, isArray: true })
  @ApiBearerAuth('access-token')
  @UseGuards(UserGuard, AdminGuard)
  @Get('/available')
  async findAllAvailableUsers(): Promise<FindAllAvailableUsersResDto[]> {
    const users =
      await this.findAllAvailableUsersUseCase.findAllAvailableUsers();
    return plainToInstance(FindAllAvailableUsersResDto, users);
  }

  @ApiOkResponse({ type: FindUserByIdResDto })
  @ApiBearerAuth('access-token')
  @UseGuards(UserGuard, AdminGuard)
  @Get('/:id')
  async findUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindUserByIdResDto> {
    const user = await this.findUserByIdUseCase.findUserById(
      new FindUserByIdCmd(id),
    );
    return plainToInstance(FindUserByIdResDto, user);
  }

  @ApiOkResponse({ type: UpdateUserResDto })
  @ApiBearerAuth('access-token')
  @UseGuards(UserGuard, AdminGuard)
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

  @ApiOkResponse({ type: CreateUserResDto })
  @ApiBearerAuth('access-token')
  @UseGuards(UserGuard, AdminGuard)
  @Post()
  async createUser(@Body() req: CreateUserReqDto): Promise<CreateUserResDto> {
    const createdUser = await this.createUserUseCase.createUser(
      new CreateUserCmd(req.username, req.surname, req.name),
    );
    return plainToInstance(CreateUserResDto, createdUser);
  }

  @ApiOkResponse()
  @ApiBearerAuth('access-token')
  @UseGuards(UserGuard, AdminGuard)
  @Delete('/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.deleteUserUseCase.deleteUser(new DeleteUserCmd(id));
  }
}
