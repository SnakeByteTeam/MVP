import { Payload } from '../../domain/payload';
import { GenerateChangePasswordRefreshTokenCmd } from './generate-change-password-refresh-token-cmd';

describe('GenerateChangePasswordRefreshTokenCmd', () => {
  it('should be defined', () => {
    expect(
      new GenerateChangePasswordRefreshTokenCmd(new Payload(1, '', false)),
    ).toBeDefined();
  });
});
