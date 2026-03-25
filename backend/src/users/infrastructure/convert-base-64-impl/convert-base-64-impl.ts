import { ConvertBase64Port } from '../../application/ports/out/converte-base-64-port.interface';

export class ConvertBase64Impl implements ConvertBase64Port {
  toBase64(password: string): string {
    return Buffer.from(password, 'utf-8').toString('base64');
  }
  toPlain(password: string): string {
    return Buffer.from(password, 'base64').toString('utf-8');
  }
}

export const CONVERT_BASE_64_PORT = 'CONVERT_BASE_64_PORT';
