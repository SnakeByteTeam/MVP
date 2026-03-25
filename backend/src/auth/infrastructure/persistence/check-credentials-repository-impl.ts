import { Inject } from "@nestjs/common";
import { CheckCredentialsRepository } from "../../application/repository/check-credentials-repository.interface";
import { PayloadEntity } from "../entities/payload-entity";
import { PG_POOL } from "../../../database/database.module";

export class CheckCredentialsRepositoryImpl implements CheckCredentialsRepository {

    constructor(
        @Inject(PG_POOL) private readonly conn
    ){}

    async checkCredentials(username: string, password: string): Promise<PayloadEntity> {
        const result = await this.conn.query(
            `SELECT id, role FROM users WHERE username = $1 AND password = $2`,
            [username, password]
        );

        if (result.rowCount === 0) {
            throw new Error('User not found');
        }

        const user = result.rows[0];

        return new PayloadEntity(user.id, user.role);
    }
}
