import { PlantEntity } from "src/wards/infrastructure/entities/plant-entity";

export interface WardsPlantsRelationshipsRepository {
    addPlantToWard(wardId: number, plantId: string): Promise<PlantEntity>;
    findAllPlantsByWardId(wardId: number): Promise<PlantEntity[]>;
    removePlantFromWard(plantId: string): Promise<void>;
}

export const WARDS_PLANTS_RELATIONSHIPS_REPOSITORY = 'WARDS_PLANTS_RELATIONSHIPS_REPOSITORY';
