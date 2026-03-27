import { Ward } from '../../../domain/ward';

export interface FindAllWardsPort {
  findAllWard(): Promise<Ward[]>;
}
