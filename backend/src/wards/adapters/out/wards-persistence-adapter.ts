import { Inject } from "@nestjs/common";
import { CreateWardCmd } from "src/wards/application/commands/create-ward-cmd";
import { DeleteWardCmd } from "src/wards/application/commands/delete-ward-cmd";
import { UpdateWardCmd } from "src/wards/application/commands/update-ward-cmd";
import { CreateWardPort } from "src/wards/application/ports/out/create-ward-port.interface";
import { DeleteWardPort } from "src/wards/application/ports/out/delete-ward-port.interface";
import { FindAllWardsPort } from "src/wards/application/ports/out/find-all-wards-port.interface";
import { UpdateWardPort } from "src/wards/application/ports/out/update-ward-port.interface";
import { WARDS_REPOSITORY, WardsRepository } from "src/wards/application/repository/wards-repository.interface";
import { Ward } from "src/wards/domain/ward";
import { WardEntity } from "src/wards/infrastructure/entities/ward-entity";

export class WardsPersistenceAdapter implements CreateWardPort, FindAllWardsPort, UpdateWardPort, DeleteWardPort {
    constructor(
        @Inject(WARDS_REPOSITORY)
        private readonly wardsRepository: WardsRepository,
    ) { }

    async createWard(req: CreateWardCmd): Promise<Ward> {
        const res: WardEntity = await this.wardsRepository.createWard(
            req.name,
        );

        return new Ward(res.id, res.name);
    }

    async findAllWards(): Promise<Ward[]> {
        const res: WardEntity[] = await this.wardsRepository.findAllWards();

        return res.map((element) => new Ward(element.id, element.name));
    }

    async updateWard(req: UpdateWardCmd): Promise<Ward> {
        const res: WardEntity = await this.wardsRepository.updateWard(
            req.id,
            req.name,
        );

        return new Ward(res.id, res.name);
    }

    async deleteWard(req: DeleteWardCmd): Promise<void> {
        return await this.wardsRepository.deleteWard(req.id);
    }
}
