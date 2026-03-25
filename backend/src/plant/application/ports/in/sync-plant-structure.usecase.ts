import { Plant } from "src/plant/domain/models/plant.model";

export interface SyncPlantStructureUseCase {
    sync(plantId: string): Promise<boolean>;
}

export const SYNC_PLANT_STRUCTURE_USECASE = Symbol('SyncPlantStructureUseCase');

