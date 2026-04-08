import { Inject } from '@nestjs/common';
import { HashPasswordCmd } from '../../application/commands/hash-password-cmd';
import { HashPasswordPort } from '../../application/ports/out/hash-password-port.interface';
import { PASSWORD_HASHER } from '../../infrastructure/sha512-password-hasher/sha512-password-hasher';
import { PasswordHasher } from '../../application/password/password-hasher.interface';

export class HashPasswordAdapter implements HashPasswordPort {
  constructor(
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
  ) {}

  hashPassword(req: HashPasswordCmd): string {
    return this.passwordHasher.hashPassword(req.password);
  }
}

export const HASH_PASSWORD_PORT = 'HASH_PASSWORD_PORT';
