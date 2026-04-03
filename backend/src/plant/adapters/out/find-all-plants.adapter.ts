import { Inject, Injectable } from "@nestjs/common";
import { FindAllPlantsPort } from "src/plant/application/ports/out/find-all-plants.port";
import { FIND_ALL_PLANTS_REPO_PORT, FindAllPlantsRepoPort } from "src/plant/application/repository/find-all-plants.repository";
import { Plant } from "src/plant/domain/models/plant.model";
import { PlantEntity } from "src/plant/infrastructure/persistence/entities/plant.entity";


@Injectable()
export class FindAllPlantsAdapter implements FindAllPlantsPort {
    constructor(
        @Inject(FIND_ALL_PLANTS_REPO_PORT)
        private readonly plantsRepoPort: FindAllPlantsRepoPort
    ) {}

    async findAllPlants(): Promise<Plant[] | null> {
        const plant: PlantEntity[] | null = await this.plantsRepoPort.findAllPlants();
        if (!plant) return null;

        return plant.map((entity: PlantEntity) => PlantEntity.toDomain(entity));
    }


}