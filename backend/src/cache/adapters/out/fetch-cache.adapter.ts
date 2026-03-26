import { Injectable, Inject} from "@nestjs/common";
import { FetchNewCacheCmd } from "src/cache/application/commands/fetch-new-cache.command";
import { FetchNewCachePort } from "src/cache/application/ports/out/fetch-new-cache.port";
import { FETCH_NEW_CACHE_REPO_PORT, type FetchNewCacheRepoPort } from "src/cache/application/repository/fetch-new-cache.repository";
import { Plant } from "src/plant/domain/models/plant.model";
import { PlantDto } from "src/plant/infrastructure/dtos/plant.dto";
import { type GetValidTokenPort, GETVALIDTOKENPORT } from "src/tokens/application/ports/out/get-valid-token.port";

@Injectable()
export class FetchNewCacheAdapter implements FetchNewCachePort {

    constructor(
        @Inject(GETVALIDTOKENPORT)
        private readonly getValidTokenPort: GetValidTokenPort,
        @Inject(FETCH_NEW_CACHE_REPO_PORT)
        private readonly fetchNewCacheRepo: FetchNewCacheRepoPort
    ) {}

    async fetch(cmd: FetchNewCacheCmd): Promise<Plant> {
        if(!cmd?.plantId) throw new Error('PlantId is null');

        const validToken: string | null = await this.getValidTokenPort.getValidToken();
        if(!validToken) throw new Error('Valid token not found');

        const plantDto: PlantDto | null = await this.fetchNewCacheRepo.fetch(validToken, cmd.plantId);
        if(!plantDto) throw new Error('Plant not found');

        return PlantDto.toDomain(plantDto);
    }
}
