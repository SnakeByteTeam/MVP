export interface PasswordHasher {
  hashPassword(password: string): string;
}
