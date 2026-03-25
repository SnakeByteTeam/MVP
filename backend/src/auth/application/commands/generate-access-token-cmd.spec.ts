import { Payload } from '../../domain/payload';
import { GenerateAccessTokenCmd } from './generate-access-token-cmd';

describe('GenerateTokenCmd', () => {
  it('should be defined', () => {
    expect(new GenerateAccessTokenCmd(new Payload(1, ''))).toBeDefined();
  });
});
