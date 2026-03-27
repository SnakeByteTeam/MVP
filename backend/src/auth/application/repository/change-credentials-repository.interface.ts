export interface ChangeCredentialsRepository {
  changeCredentials(
    username: string,
    newPassword: string,
    firstAccess: boolean,
  ): Promise<void>;
}

export const CHANGE_CREDENTIALS_REPOSITORY = 'CHANGE_CREDENTIALS_REPOSITORY';
