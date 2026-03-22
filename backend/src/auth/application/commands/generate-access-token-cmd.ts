import { Payload } from "../../domain/payload";

export class GenerateAccessTokenCmd {
    constructor(
        public payload: Payload,
    ){}
}
