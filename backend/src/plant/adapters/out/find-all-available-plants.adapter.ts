import { Inject, Injectable } from "@nestjs/common";
import { FindAllAvailablePlantsPort } from "src/plant/application/ports/out/find-all-available-plants.port";
import { FIND_ALL_AVAILABLE_PLANTS_REPO_PORT, type FindAllAvailablePlantsRepoPort } from "src/plant/application/repository/find-all-plants.repository";
import { Plant } from "src/plant/domain/models/plant.model";
import { PlantEntity } from "src/plant/infrastructure/persistence/entities/plant.entity";

@Injectable()
export class FindAllAvailablePlantsAdapter implements FindAllAvailablePlantsPort {

    constructor(
        @Inject(FIND_ALL_AVAILABLE_PLANTS_REPO_PORT)
        private readonly repo: FindAllAvailablePlantsRepoPort
    ) {}

    async findAllAvailablePlants(): Promise<Plant[] | null> {
        const plant: PlantEntity[] | null = await this.repo.findAllAvailablePlants();
        if(!plant) return null;

        return plant.map((entity: PlantEntity) => PlantEntity.toDomain(entity));
    }
}