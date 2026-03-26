import { Payload } from "../../domain/payload";

export class GenerateChangePasswordRefreshTokenCmd {
    constructor(public payload: Payload) {}
}
