import { Inject } from "@nestjs/common";
import { CreateWardCmd } from "../../application/commands/create-ward-cmd";
import { CreateWardPort } from "../../application/ports/out/create-ward-port.interface";
import { Ward } from "../../domain/ward";
import { CREATE_WARD_REPOSITORY } from "../../application/repository/create-ward-repository.interface";
import { WardEntity } from "../../infrastructure/entities/ward-entity";

export class CreateWardAdapter implements CreateWardPort{

    constructor(
        @Inject(CREATE_WARD_REPOSITORY) private readonly createWardRepository
    ){}

    createWard(req: CreateWardCmd): Ward {
        const res: WardEntity = this.createWardRepository.createWard(req.name);

        return new Ward(
            res.id,
            res.name
        );
    }
}
