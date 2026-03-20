import { PasswordGeneratorPort } from "../../application/ports/out/password-generator-port.interface";

export class PasswordGenerator implements PasswordGeneratorPort {
    generatePassword(length: number): string {
        return require('generate-password').generate({
            length: length,
            numbers: true,
            uppercase: true,
            lowercase: true
        });
    }
}

export const PASSWORD_GENERATOR_PORT = 'PASSWORD_GENERATOR_PORT';
