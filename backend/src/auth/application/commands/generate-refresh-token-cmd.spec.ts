import { Payload } from '../../domain/payload';
import { GenerateRefreshTokenCmd } from './generate-refresh-token-cmd';

describe('GenerateRefreshTokenCmd', () => {
  it('should be defined', () => {
    expect(
      new GenerateRefreshTokenCmd(new Payload(1, '', false)),
    ).toBeDefined();
  });
});
