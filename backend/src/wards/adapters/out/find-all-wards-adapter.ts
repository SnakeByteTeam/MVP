import { Inject } from "@nestjs/common";
import { FindAllWardsPort } from "../../application/ports/out/find-all-wards-port.interface";
import { Ward } from "../../domain/ward";
import { FIND_ALL_WARDS_REPOSITORY, FindAllWardsRepository } from "../../application/repository/find-all-wards-repository.interface";
import { WardEntity } from "../../infrastructure/entities/ward-entity";

export class FindAllWardsAdapter implements FindAllWardsPort{

    constructor(
        @Inject(FIND_ALL_WARDS_REPOSITORY) private readonly findAllWardsRepository: FindAllWardsRepository
    ){}

    findAllWard(): Ward[] {
        const res: WardEntity[] = this.findAllWardsRepository.findAllWards();

        const wards: Ward[] = [];

        res.forEach((element) => {
            wards.concat(new Ward(
                element.id,
                element.name
            ))
        });

        return wards;
    }
}
