import { UserDto } from "./user.model.dto";

// Descrive la risposta inviata dal backend alla chiamata `POST /users
export interface UserCreatedResponseDto {
    user: UserDto;
    temporaryPassword: string;
}
