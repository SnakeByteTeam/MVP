import { Inject } from "@nestjs/common";
import { ChangeCredentialsRepository } from "../../application/repository/change-credentials-repository.interface";
import { PG_POOL } from "../../../database/database.module";

export class ChangeCredentialsRepositoryImpl implements ChangeCredentialsRepository {

    constructor(@Inject(PG_POOL) private readonly conn){}

    async changeCredentials(username: string, newPassword: string, firstAccess: boolean): Promise<void> {
        await this.conn.query(
            'UPDATE "user" SET password = $1, first_access = $2 WHERE username = $3',
            [newPassword, firstAccess, username]
        );
    }
}
