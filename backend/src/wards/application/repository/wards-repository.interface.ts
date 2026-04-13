import { WardEntity } from "src/wards/infrastructure/entities/ward-entity";

export interface WardsRepository {
    createWard(name: string): Promise<WardEntity>;
    findAllWards(): Promise<WardEntity[]>;
    updateWard(id: number, name: string): Promise<WardEntity>;
    deleteWard(id: number): Promise<void>;
}

export const WARDS_REPOSITORY = 'WARDS_REPOSITORY';
