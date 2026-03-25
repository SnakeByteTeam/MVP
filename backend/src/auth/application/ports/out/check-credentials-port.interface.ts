import { Payload } from '../../../domain/payload';
import { CheckCredentialsCmd } from '../../commands/check-credentials-cmd';

export interface CheckCredentialsPort {
  checkCredentials(req: CheckCredentialsCmd): Promise<Payload>;
}
