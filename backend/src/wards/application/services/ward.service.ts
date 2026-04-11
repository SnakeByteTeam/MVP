import { Ward } from '../../domain/ward';
import { CreateWardCmd } from '../commands/create-ward-cmd';
import { UpdateWardCmd } from '../commands/update-ward-cmd';
import { DeleteWardCmd } from '../commands/delete-ward-cmd';
import { CreateWardUseCase } from '../ports/in/create-ward-use-case.interface';
import { DeleteWardUseCase } from '../ports/in/delete-ward-use-case.interface';
import { FindAllWardsUseCase } from '../ports/in/find-all-wards-use-case.interface';
import { UpdateWardUseCase } from '../ports/in/update-ward-use-case.interface';
import { Inject } from '@nestjs/common';
import { CREATE_WARD_PORT, CreateWardPort } from '../ports/out/create-ward-port.interface';
import { DELETE_WARD_PORT, DeleteWardPort } from '../ports/out/delete-ward-port.interface';
import { FIND_ALL_WARDS_PORT, FindAllWardsPort } from '../ports/out/find-all-wards-port.interface';
import { UPDATE_WARD_PORT, UpdateWardPort } from '../ports/out/update-ward-port.interface';

export class WardService
  implements
    CreateWardUseCase,
    FindAllWardsUseCase,
    UpdateWardUseCase,
    DeleteWardUseCase
{
  constructor(
    @Inject(CREATE_WARD_PORT) private readonly createWardPort: CreateWardPort,
    @Inject(FIND_ALL_WARDS_PORT)
    private readonly findAllWardsPort: FindAllWardsPort,
    @Inject(DELETE_WARD_PORT) private readonly deleteWardPort: DeleteWardPort,
    @Inject(UPDATE_WARD_PORT) private readonly updateWardPort: UpdateWardPort,
  ) {}

  async createWard(req: CreateWardCmd): Promise<Ward> {
    return await this.createWardPort.createWard(req);
  }
  async findAllWards(): Promise<Ward[]> {
    return await this.findAllWardsPort.findAllWards();
  }
  async updateWard(req: UpdateWardCmd): Promise<Ward> {
    return await this.updateWardPort.updateWard(req);
  }
  async deleteWard(req: DeleteWardCmd): Promise<void> {
    return await this.deleteWardPort.deleteWard(req);
  }
}

export const CREATE_WARD_USE_CASE = 'CREATE_WARD_USE_CASE';
export const FIND_ALL_WARD_USE_CASE = 'FIND_ALL_WARD_USE_CASE';
export const UPDATE_WARD_USE_CASE = 'UPDATE_WARD_USE_CASE';
export const DELETE_WARD_USE_CASE = 'DELETE_WARD_USE_CASE';
