import { Inject } from "@nestjs/common";
import { CreateUserCmd } from "../../application/commands/create-user-cmd";
import { CreateUserPort } from "../../application/ports/out/create-user-port.interface";
import { User } from "../../domain/user";
import { CREATE_USER_REPOSITORY, CreateUserRepository } from "../../application/repository/create-user-repository.interface";
import { UserEntity } from "../../infrastructure/entities/user-entity";

export class CreateUserAdapter implements CreateUserPort {

    constructor(
        @Inject(CREATE_USER_REPOSITORY) private readonly createUserRepository: CreateUserRepository
    ){}

    createUser(req: CreateUserCmd): User {
        const res: UserEntity = this.createUserRepository.createUser(
            req.username,
            req.surname,
            req.name,
            req.tempPassword
        );

        return new User(
            res.id,
            res.username,
            res.surname,
            res.name,
            res.role
        )
    }
}
