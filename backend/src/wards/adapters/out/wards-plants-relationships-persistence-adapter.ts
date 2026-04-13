import { Inject } from "@nestjs/common";
import { Plant } from "src/plant/domain/models/plant.model";
import { AddPlantToWardCmd } from "src/wards/application/commands/add-plant-to-ward-cmd";
import { FindAllPlantsByWardIdCmd } from "src/wards/application/commands/find-all-plants-by-ward-id-cmd";
import { RemovePlantFromWardCmd } from "src/wards/application/commands/remove-plant-from-ward-cmd";
import { AddPlantToWardPort } from "src/wards/application/ports/out/add-plant-to-ward-port.interface";
import { FindAllPlantsByWardIdPort } from "src/wards/application/ports/out/find-all-plants-by-ward-id-port.interface";
import { RemovePlantFromWardPort } from "src/wards/application/ports/out/remove-plant-from-ward-port.interface";
import { WARDS_PLANTS_RELATIONSHIPS_REPOSITORY, WardsPlantsRelationshipsRepository } from "src/wards/application/repository/wards-plants-relationships-repository.interface";
import { PlantEntity } from "src/wards/infrastructure/entities/plant-entity";

export class WardsPlantsRelationshipsPersistenceAdapter implements AddPlantToWardPort, FindAllPlantsByWardIdPort, RemovePlantFromWardPort {
    constructor(
        @Inject(WARDS_PLANTS_RELATIONSHIPS_REPOSITORY)
        private readonly wardsPlantsRelationShipsRepository: WardsPlantsRelationshipsRepository,
    ) { }

    async addPlantToWard(req: AddPlantToWardCmd): Promise<Plant> {
        const plantEntity: PlantEntity =
            await this.wardsPlantsRelationShipsRepository.addPlantToWard(
                req.wardId,
                req.plantId,
            );

        return new Plant(plantEntity.id, plantEntity.name);
    }

    async findAllPlantsByWardId(req: FindAllPlantsByWardIdCmd): Promise<Plant[]> {
        const plantEntities: PlantEntity[] =
            await this.wardsPlantsRelationShipsRepository.findAllPlantsByWardId(req.id);

        return plantEntities.map(
            (plantEntity) => new Plant(plantEntity.id, plantEntity.name),
        );
    }

    async removePlantFromWard(req: RemovePlantFromWardCmd): Promise<void> {
        return await this.wardsPlantsRelationShipsRepository.removePlantFromWard(
            req.plantId,
        );
    }
}
