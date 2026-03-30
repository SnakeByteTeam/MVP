import { Injectable, Inject } from "@nestjs/common";
import { GetAllPlantIdsPort } from "src/cache/application/ports/out/get-all-plantids.port";
import { GET_ALL_PLANTIDS_REPO_PORT, type GetAllPlantIdsRepoPort } from "src/cache/application/repository/get-all-plantids.repository";
import { GETVALIDTOKENPORT, type GetValidTokenPort} from "src/tokens/application/ports/out/get-valid-token.port";

@Injectable()
export class GetAllPlantIdsAdapter implements GetAllPlantIdsPort {

    constructor(
        @Inject(GET_ALL_PLANTIDS_REPO_PORT) private readonly repo: GetAllPlantIdsRepoPort,
        @Inject(GETVALIDTOKENPORT) private readonly getValidTokenPort: GetValidTokenPort
    ) {}

    async getAllPlantIds(): Promise<string[]> {
        const token = await this.getValidTokenPort.getValidToken();
        if (!token) throw new Error('Failed to get valid token');

        return await this.repo.getAllPlantIds(token);
    }
}