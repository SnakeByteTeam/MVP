import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
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
    private readonly deleteWardUseCase: DeleteWardCmd,
  ) {}

  @Post()
  async createWard(@Body() req: CreateWardReqDto) {
    return this.createWardUseCase.createWard(new CreateWardCmd(req.name));
  }

  @Get()
  async findAllWards() {
    return this.findAllWardUseCase.findAllWard();
  }

  @Put('/:id')
  async updateWard(@Param('id') id: number, @Body() req: UpdateWardReqDto) {
    return this.updateWardUseCase.updateWard(new UpdateWardCmd(id, req.name));
  }

  @Delete('/:id')
  async deleteWard(@Param('id') id: number) {
    return this.deleteWardUseCase.deleteWard(new DeleteWardCmd(id));
  }
}
