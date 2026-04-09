import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateWardReqDto } from '../../infrastructure/dtos/in/create-ward-req.dto';
import { UpdateWardReqDto } from '../../infrastructure/dtos/in/update-ward-req.dto';
import { CreateWardUseCase } from '../../application/ports/in/create-ward-use-case.interface';
import { FindAllWardsUseCase } from '../../application/ports/in/find-all-wards-use-case.interface';
import { UpdateWardUseCase } from '../../application/ports/in/update-ward-use-case.interface';
import { DeleteWardCmd } from '../../application/commands/delete-ward-cmd';
import { CreateWardCmd } from '../../application/commands/create-ward-cmd';
import { UpdateWardCmd } from '../../application/commands/update-ward-cmd';
import {
  CREATE_WARD_USE_CASE,
  DELETE_WARD_USE_CASE,
  FIND_ALL_WARD_USE_CASE,
  UPDATE_WARD_USE_CASE,
} from '../../application/services/ward.service';
import { DeleteWardUseCase } from '../../application/ports/in/delete-ward-use-case.interface';
import { CreateWardResDto } from '../../infrastructure/dtos/out/create-ward-res.dto';
import { plainToInstance } from 'class-transformer';
import { FindAllWardsResDto } from '../../infrastructure/dtos/out/find-all-wards-res.dto';
import { UpdateWardResDto } from '../../infrastructure/dtos/out/update-ward-res.dto';
import { AdminGuard } from 'src/guard/admin/admin.guard';
import { UserGuard } from 'src/guard/user/user.guard';

@Controller('wards')
export class WardsController {
  constructor(
    @Inject(CREATE_WARD_USE_CASE)
    private readonly createWardUseCase: CreateWardUseCase,
    @Inject(FIND_ALL_WARD_USE_CASE)
    private readonly findAllWardUseCase: FindAllWardsUseCase,
    @Inject(UPDATE_WARD_USE_CASE)
    private readonly updateWardUseCase: UpdateWardUseCase,
    @Inject(DELETE_WARD_USE_CASE)
    private readonly deleteWardUseCase: DeleteWardUseCase,
  ) {}

  @UseGuards(UserGuard, AdminGuard)
  @Post()
  async createWard(@Body() req: CreateWardReqDto): Promise<CreateWardResDto> {
    const ward = await this.createWardUseCase.createWard(
      new CreateWardCmd(req.name),
    );
    return plainToInstance(CreateWardResDto, ward);
  }

  @UseGuards(UserGuard, AdminGuard)
  @Get()
  async findAllWards(): Promise<FindAllWardsResDto[]> {
    const wards = await this.findAllWardUseCase.findAllWards();
    return plainToInstance(FindAllWardsResDto, wards);
  }

  @UseGuards(UserGuard, AdminGuard)
  @Put('/:id')
  async updateWard(
    @Param('id') id: number,
    @Body() req: UpdateWardReqDto,
  ): Promise<UpdateWardResDto> {
    const ward = await this.updateWardUseCase.updateWard(
      new UpdateWardCmd(id, req.name),
    );
    return plainToInstance(UpdateWardResDto, ward);
  }

  @UseGuards(UserGuard, AdminGuard)
  @Delete('/:id')
  async deleteWard(@Param('id') id: number): Promise<void> {
    return await this.deleteWardUseCase.deleteWard(new DeleteWardCmd(id));
  }
}
