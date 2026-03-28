import { Inject } from '@nestjs/common';
import { CheckCredentialsCmd } from '../../application/commands/check-credentials-cmd';
import { CheckCredentialsPort } from '../../application/ports/out/check-credentials-port.interface';
import { Payload } from '../../domain/payload';
import {
  CHECK_CREDENTIALS_REPOSITORY,
  CheckCredentialsRepository,
} from '../../application/repository/check-credentials-repository.interface';
import { PayloadEntity } from '../../infrastructure/entities/payload-entity';

export class CheckCredentialsAdapter implements CheckCredentialsPort {
  constructor(
    @Inject(CHECK_CREDENTIALS_REPOSITORY)
    private readonly checkCredentialsRepository: CheckCredentialsRepository,
  ) {}

  async checkCredentials(req: CheckCredentialsCmd): Promise<Payload> {
    const credentials: PayloadEntity =
      await this.checkCredentialsRepository.checkCredentials(
        req.username,
        req.password,
      );
    return new Payload(
      credentials.id,
      credentials.role,
      credentials.firstAccess,
    );
  }
}

export const CHECK_CREDENTIALS_PORT = 'CHECK_CREDENTIALS_PORT';
