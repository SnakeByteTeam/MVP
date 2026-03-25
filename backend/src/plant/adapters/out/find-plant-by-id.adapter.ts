import { Inject, Injectable } from "@nestjs/common";
import { FindPlantByIdCmd } from "src/plant/application/commands/find-plant-by-id.command";
import { FindPlantByIdPort } from "src/plant/application/ports/out/find-plant-by-id.port";
import { FIND_PLANT_BY_ID_REPO_PORT, type FindPlantByIdRepoPort } from "src/plant/application/repository/find-plant-by-id.repository";
import { Plant } from "src/plant/domain/models/plant.model";
import { PlantEntity } from "src/plant/infrastructure/persistence/entities/plant.entity";

@Injectable()
export class FindPlantByIdAdapter implements FindPlantByIdPort{
    constructor(
        @Inject(FIND_PLANT_BY_ID_REPO_PORT) private readonly findByIdRepo: FindPlantByIdRepoPort,
    ) {}
    async findById(cmd: FindPlantByIdCmd): Promise<Plant>{
        const plantId: string = cmd?.id;
        if(!plantId) throw(new Error('PlantId is null'))

        const entity: PlantEntity | null = await this.findByIdRepo.findById(plantId);

        if(!entity) throw(new Error('Can\'t get plant info from db'));

        return PlantEntity.toDomain(entity);
    }
}