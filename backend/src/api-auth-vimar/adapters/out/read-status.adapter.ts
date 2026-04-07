import { Inject, Injectable} from "@nestjs/common";
import { ReadStatusPort } from "src/api-auth-vimar/application/ports/out/read-status.port";
import { READ_STATUS_REPO_PORT, type ReadStatusRepoPort } from "src/api-auth-vimar/application/repository/read-status.repository";

@Injectable()
export class ReadStatusAdapter implements ReadStatusPort {
    constructor(
        @Inject(READ_STATUS_REPO_PORT)
        private readonly readStatusRepo: ReadStatusRepoPort
    ) {}

    async readStatus(userId: number): Promise<{ isLinked: boolean; email: string }> {
        const email = await this.readStatusRepo.readStatus(userId);
        return {
            isLinked: !!email,
            email: email || '',
        };
    }
}