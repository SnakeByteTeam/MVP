import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AddUserToWardReqDto } from '../../infrastructure/dtos/in/add-user-to-ward-req.dto';
import { AddUserToWardUseCase } from '../../application/ports/in/add-user-to-ward-use-case.interface';
import { FindAllUsersByWardIdUseCase } from '../../application/ports/in/find-all-users-by-ward-id-use-case.interface';
import { RemoveUserFromWardUseCase } from '../../application/ports/in/remove-user-from-ward-use-case.interface';
import {
  ADD_USER_TO_WARD_USE_CASE,
  FIND_ALL_USERS_BY_WARD_ID_USE_CASE,
  REMOVE_USER_FROM_WARD_USE_CASE,
} from '../../application/services/wards-users-relationships.service';
import { AddUserToWardCmd } from '../../application/commands/add-user-to-ward-cmd';
import { FindAllUsersByWardIdCmd } from '../../application/commands/find-all-users-by-ward-id-cmd';
import { RemoveUserFromWardCmd } from '../../application/commands/remove-user-from-ward-cmd';
import { plainToInstance } from 'class-transformer';
import { AddUserToWardResDto } from '../../infrastructure/dtos/out/add-user-to-ward-res-dto';
import { FindAllUsersByWardIdResDto } from '../../infrastructure/dtos/out/find-all-users-by-ward-id-res.dto';
import { User } from '../../domain/user';
import { AdminGuard } from 'src/guard/admin/admin.guard';
import { UserGuard } from 'src/guard/user/user.guard';

@Controller('wards-users-relationships')
export class WardsUsersRelationshipsController {
  constructor(
    @Inject(ADD_USER_TO_WARD_USE_CASE)
    private readonly addUserToWardUseCase: AddUserToWardUseCase,
    @Inject(FIND_ALL_USERS_BY_WARD_ID_USE_CASE)
    private readonly findAllUsersByWardIdUseCase: FindAllUsersByWardIdUseCase,
    @Inject(REMOVE_USER_FROM_WARD_USE_CASE)
    private readonly removeUserFromWardUseCase: RemoveUserFromWardUseCase,
  ) {}

  @UseGuards(UserGuard, AdminGuard)
  @Post()
  async addUserToWard(
    @Body() req: AddUserToWardReqDto,
  ): Promise<AddUserToWardResDto> {
    const user: User = await this.addUserToWardUseCase.addUserToWard(
      new AddUserToWardCmd(req.wardId, req.userId),
    );

    return plainToInstance(AddUserToWardResDto, user);
  }

  @UseGuards(UserGuard, AdminGuard)
  @Get('/:wardId')
  async findAllUsersByWardId(
    @Param('wardId', ParseIntPipe) id: number,
  ): Promise<FindAllUsersByWardIdResDto[]> {
    const users: User[] =
      await this.findAllUsersByWardIdUseCase.findAllUsersByWardId(
        new FindAllUsersByWardIdCmd(id),
      );

    return plainToInstance(FindAllUsersByWardIdResDto, users);
  }

  @UseGuards(UserGuard, AdminGuard)
  @Delete('/:wardId/:userId')
  async removeUserFromWard(
    @Param('wardId', ParseIntPipe) wardId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    return await this.removeUserFromWardUseCase.removeUserFromWard(
      new RemoveUserFromWardCmd(wardId, userId),
    );
  }
}
