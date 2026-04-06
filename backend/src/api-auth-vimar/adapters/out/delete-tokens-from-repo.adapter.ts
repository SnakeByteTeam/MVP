import { Inject, Injectable } from '@nestjs/common';
import {
  DELETETOKENSCACHEPORT,
  type DeleteTokensCachePort,
} from 'src/api-auth-vimar/application/repository/delete-tokens-cache.port';
import { DeleteTokensFromRepoPort } from 'src/api-auth-vimar/application/ports/out/delete-tokens-from-repo.port';

@Injectable()
export class DeleteTokensFromRepoAdapter implements DeleteTokensFromRepoPort {
  constructor(
    @Inject(DELETETOKENSCACHEPORT)
    private readonly deleteTokensCachePort: DeleteTokensCachePort,
  ) {}

  async deleteTokens(): Promise<boolean> {
    return this.deleteTokensCachePort.deleteTokens();
  }
}
