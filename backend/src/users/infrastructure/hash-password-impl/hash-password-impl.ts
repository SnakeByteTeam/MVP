import { HashPasswordPort } from '../../application/ports/out/hash-password-port.interface';
import { createHash } from 'node:crypto';

export class HashPasswordImpl implements HashPasswordPort {
  hashPassword(password: string): string {
    const hash = createHash('sha512');
    hash.update(password);
    return hash.digest('hex');
  }
}

export const HASH_PASSWORD_PORT = 'HASH_PASSWORD_PORT';
