import { ChangeCredentialsCmd } from '../../commands/change-credentials-cmd';

export interface ChangeCredentialsPort {
  changeCredentials(req: ChangeCredentialsCmd): Promise<void>;
}

export const CHANGE_CREDENTIALS_PORT = 'CHANGE_CREDENTIALS_PORT';
