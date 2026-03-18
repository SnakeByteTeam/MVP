import { CreateUserRepository } from "../../application/repository/create-user-repository.interface";
import { DeleteUserRepository } from "../../application/repository/delete-user-repository.interface";
import { FindAllUsersRepository } from "../../application/repository/find-all-users-repository.interface";
import { UpdateUserRepository } from "../../application/repository/update-user-repository.interface";
import { UserEntity } from "../entities/user-entity";

export class UsersRepositoryImpl implements 
    FindAllUsersRepository, 
    UpdateUserRepository, 
    CreateUserRepository, 
    DeleteUserRepository {

    findAllUsers(): UserEntity[] {
        throw new Error("Method not implemented.");
    }
    updateUser(id: number, username: string, surname: string, name: string, role: string): UserEntity {
        throw new Error("Method not implemented.");
    }
    createUser(username: string, surname: string, name: string, tempPassword: string): UserEntity {
        throw new Error("Method not implemented.");
    }
    DeleteUserAdapter(id: number): void {
        throw new Error("Method not implemented.");
    }
}
