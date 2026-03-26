import { Ward } from '../../../domain/ward';

export interface FindAllWardsUseCase {
  findAllWard(): Promise<Ward[]>;
}
