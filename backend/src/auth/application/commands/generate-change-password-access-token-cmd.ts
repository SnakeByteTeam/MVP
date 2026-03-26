import { Payload } from "../../domain/payload";

export class GenerateChangePasswordAccessTokenCmd {
    constructor(public payload: Payload) {}
}
