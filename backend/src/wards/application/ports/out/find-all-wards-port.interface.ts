import { Ward } from '../../../domain/ward';

export interface FindAllWardsPort {
  findAllWards(): Promise<Ward[]>;
}
