import { PayloadEntity } from "../../infrastructure/entities/payload-entity";

export interface CheckCredentialsRepository {
  checkCredentials(username: string, password: string): Promise<PayloadEntity>;
}

export const CHECK_CREDENTIALS_REPOSITORY = 'CHECK_CREDENTIALS_REPOSITORY';
