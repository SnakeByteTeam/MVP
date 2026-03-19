import { WardEntity } from "../../infrastructure/entities/ward-entity";

export interface CreateWardRepository {
    createWard(name: string): WardEntity;
}

export const CREATE_WARD_REPOSITORY = 'CREATE_WARD_REPOSITORY';