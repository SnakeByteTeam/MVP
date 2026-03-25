import { Payload } from '../../domain/payload';

export class GenerateRefreshTokenCmd {
  constructor(public payload: Payload) {}
}
