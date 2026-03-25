import { Inject, Injectable } from "@nestjs/common";
import { SyncPlantStructureUseCase } from "../ports/in/sync-plant-structure.usecase";
import { FETCH_PLANT_STRUCTURE_PORT, FetchPlantStructurePort } from "../ports/out/fetch-plant-structure.port";

@Injectable()
export class PlantService implements SyncPlantStructureUseCase {
    constructor(
        @Inject(FETCH_PLANT_STRUCTURE_PORT) private readonly fetchPlant: FetchPlantStructurePort
    ) {}

    async sync(plantId: string) {
        await this.fetchPlant.fetch(plantId);
    }
}