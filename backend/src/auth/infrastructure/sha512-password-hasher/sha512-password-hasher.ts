import { createHash } from 'node:crypto';
import { PasswordHasher } from '../../application/password/password-hasher.interface';

export class Sha512PasswordHasher implements PasswordHasher {
  hashPassword(password: string): string {
    return createHash('sha512').update(password).digest('hex');
  }
}

export const PASSWORD_HASHER = 'PASSWORD_HASHER';
