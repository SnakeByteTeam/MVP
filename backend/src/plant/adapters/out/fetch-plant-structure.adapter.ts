import { Inject, Injectable } from "@nestjs/common";
import { FetchPlantStructurePort } from "src/plant/application/ports/out/fetch-plant-structure.port";
import { type FetchPlantStructureRepo, FETCH_PLANT_STRUCTURE_REPO_PORT} from "src/plant/application/repository/fetch-plant-structure.repository";
import { Plant } from "src/plant/domain/models/plant.model";
import { PlantDto } from "src/plant/infrastructure/dtos/plant.dto";
import { type GetValidTokenPort, GETVALIDTOKENPORT } from "src/tokens/application/ports/out/get-valid-token.port";

@Injectable()
export class FetchPlantStructureAdapter implements FetchPlantStructurePort {

    constructor(
        @Inject(GETVALIDTOKENPORT) private readonly tokenPort: GetValidTokenPort,
        @Inject(FETCH_PLANT_STRUCTURE_REPO_PORT) private readonly fetchPlantRepoPort: FetchPlantStructureRepo
    ) {}

    async fetch(plantId: string) {
        const token = await this.tokenPort.getValidToken();
        if(!token) throw(new Error('Token is not valid'));

        const plantDto: PlantDto | null =  await this.fetchPlantRepoPort.fetch(token, plantId);

        if(!plantDto) throw(new Error('Can\'t get plant info from API'));

        console.log(plantDto);
    }
}