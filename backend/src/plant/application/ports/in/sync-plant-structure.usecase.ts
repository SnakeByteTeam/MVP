import { SyncPlantCmd } from "../../commands/sync-plant.command";

export interface SyncPlantStructureUseCase {
    sync(cmd: SyncPlantCmd): Promise<boolean>;
}

export const SYNC_PLANT_STRUCTURE_USECASE = Symbol('SyncPlantStructureUseCase');

