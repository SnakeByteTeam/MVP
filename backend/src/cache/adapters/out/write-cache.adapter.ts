import { Inject, Injectable } from "@nestjs/common";
import { Plant } from "src/plant/domain/models/plant.model";

import { WriteCachePort } from "src/cache/application/ports/out/write-cache.port";
import { PlantEntity } from "src/cache/infrastructure/persistence/entities/plant.entity";
import { WRITE_CACHE_REPO_PORT, type WriteCacheRepoPort } from "src/cache/application/repository/write-cache.repository";



@Injectable()
export class WriteCacheAdapter implements WriteCachePort {
    constructor(
        @Inject(WRITE_CACHE_REPO_PORT)
        private readonly writeCacheRepo: WriteCacheRepoPort,
    ) {}

    async writeStructure(plant: Plant): Promise<boolean> {
        const plantEntity = PlantEntity.fromDomain(plant);
        return await this.writeCacheRepo.write(plantEntity);
    }
}