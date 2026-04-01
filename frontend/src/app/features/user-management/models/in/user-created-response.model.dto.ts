// Risposta minima della create user: il backend espone solo la password temporanea.
export interface UserCreatedResponseDto {
    tempPassword: string;
}
