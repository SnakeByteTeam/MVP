import { GeneratePasswordPort } from "../../application/ports/out/password-generator-port.interface";

export class GeneratePasswordImpl implements GeneratePasswordPort {
    generatePassword(length: number): string {
        return require('generate-password').generate({
            length: length,
            numbers: true,
            uppercase: true,
            lowercase: true
        });
    }
}

export const GENERATE_PASSWORD_PORT = 'GENERATE_PASSWORD_PORT';
