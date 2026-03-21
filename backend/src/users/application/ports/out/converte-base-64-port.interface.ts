export interface ConverteBase64Port {
    toBase64(password: string): string;
    toPlain(password: string): string;
}
