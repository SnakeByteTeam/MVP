import { Ward } from '../../../domain/ward';

export interface FindAllWardsPort {
  findAllWards(): Promise<Ward[]>;
}

export const FIND_ALL_WARDS_PORT = 'FIND_ALL_WARDS_PORT';
