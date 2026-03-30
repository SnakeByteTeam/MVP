import { Inject } from '@nestjs/common';
import { FindAllWardsPort } from '../../application/ports/out/find-all-wards-port.interface';
import { Ward } from '../../domain/ward';
import {
  FIND_ALL_WARDS_REPOSITORY,
  FindAllWardsRepository,
} from '../../application/repository/find-all-wards-repository.interface';
import { WardEntity } from '../../infrastructure/entities/ward-entity';

export class FindAllWardsAdapter implements FindAllWardsPort {
  constructor(
    @Inject(FIND_ALL_WARDS_REPOSITORY)
    private readonly findAllWardsRepository: FindAllWardsRepository,
  ) {}

  async findAllWards(): Promise<Ward[]> {
    const res: WardEntity[] = await this.findAllWardsRepository.findAllWards();

    return res.map((element) => new Ward(element.id, element.name));
  }
}

export const FIND_ALL_WARDS_PORT = 'FIND_ALL_WARDS_PORT';
