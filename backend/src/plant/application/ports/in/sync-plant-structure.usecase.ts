export interface SyncPlantStructureUseCase {
    sync(plantId: string): Promise<boolean>;
}

export const SYNC_PLANT_STRUCTURE_USECASE = Symbol('SyncPlantStructureUseCase');

