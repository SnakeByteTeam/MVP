import { HashPasswordCmd } from '../../commands/hash-password-cmd';

export interface HashPasswordPort {
  hashPassword(req: HashPasswordCmd): string;
}
