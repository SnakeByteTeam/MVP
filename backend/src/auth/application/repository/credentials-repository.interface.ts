import { PayloadEntity } from '../../infrastructure/entities/payload-entity';

export interface CredentialsRepository {
  checkCredentials(username: string, password: string): Promise<PayloadEntity>;
changeCredentials(
    username: string,
    newPassword: string,
    firstAccess: boolean,
  ): Promise<void>;
}

export const CREDENTIALS_REPOSITORY = 'CREDENTIALS_REPOSITORY';