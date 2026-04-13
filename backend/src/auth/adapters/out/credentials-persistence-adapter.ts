import { Inject } from '@nestjs/common';
import { ChangeCredentialsPort } from '../../application/ports/out/change-credentials-port.interface';
import { ChangeCredentialsCmd } from '../../application/commands/change-credentials-cmd';
import { CREDENTIALS_REPOSITORY, CredentialsRepository } from 'src/auth/application/repository/credentials-repository.interface';
import { CheckCredentialsCmd } from 'src/auth/application/commands/check-credentials-cmd';
import { Payload } from 'src/auth/domain/payload';
import { PayloadEntity } from 'src/auth/infrastructure/entities/payload-entity';

export class CredentialsPersistenceAdapter implements ChangeCredentialsPort {
  constructor(
    @Inject(CREDENTIALS_REPOSITORY)
    private readonly credentialsRepository: CredentialsRepository,
  ) {}

  changeCredentials(req: ChangeCredentialsCmd): Promise<void> {
    return this.credentialsRepository.changeCredentials(
      req.username,
      req.newPassword,
      req.firstAccess,
    );
  }

    async checkCredentials(req: CheckCredentialsCmd): Promise<Payload> {
      const credentials: PayloadEntity =
        await this.credentialsRepository.checkCredentials(
          req.username,
          req.password,
        );
      return new Payload(
        credentials.id,
        credentials.username,
        credentials.role,
        credentials.firstAccess,
      );
    }
}
