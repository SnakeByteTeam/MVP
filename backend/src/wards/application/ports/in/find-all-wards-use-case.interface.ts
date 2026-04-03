import { Ward } from '../../../domain/ward';

export interface FindAllWardsUseCase {
  findAllWards(): Promise<Ward[]>;
}
