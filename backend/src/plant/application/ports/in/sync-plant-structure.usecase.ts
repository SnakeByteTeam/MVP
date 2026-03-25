export interface SyncPlantStructureUseCase {
    sync(plantId: string);
}

export const SYNC_PLANT_STRUCTURE_USECASE = Symbol('SyncPlantStructureUseCase');

