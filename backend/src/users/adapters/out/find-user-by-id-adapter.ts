import { Inject } from "@nestjs/common";
import { FindUserByIdCmd } from "../../application/commands/find-user-by-id-cmd";
import { FindUserByIdPort } from "../../application/ports/out/find-user-by-id-port.interface";
import { User } from "../../domain/user";
import { FIND_USER_BY_ID_REPOSITORY, FindUserByIdRepository } from "../../application/repository/find-user-by-id-repository.interface";

export class FindUserByIdAdapter implements FindUserByIdPort {

    constructor(
        @Inject(FIND_USER_BY_ID_REPOSITORY) private readonly findUserByIdRepository: FindUserByIdRepository
    ){}

    async findUserById(req: FindUserByIdCmd): Promise<User | null> {
        const userEntity = await this.findUserByIdRepository.findUserById(req.id);

        if(userEntity == null){
            return null;
        }

        return new User(
            userEntity.id,
            userEntity.username,
            userEntity.surname,
            userEntity.name,
            userEntity.role
        )
    }
}

export const FIND_USER_BY_ID_PORT = 'FIND_USER_BY_ID_PORT';
