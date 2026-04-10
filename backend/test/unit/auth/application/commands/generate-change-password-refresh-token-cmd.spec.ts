import { Payload } from 'src/auth/domain/payload';
import { GenerateChangePasswordRefreshTokenCmd } from 'src/auth/application/commands/generate-change-password-refresh-token-cmd';

describe('GenerateChangePasswordRefreshTokenCmd', () => {
  it('should be defined', () => {
    expect(
      new GenerateChangePasswordRefreshTokenCmd(
        new Payload(1, 'user', 'OPERATORE_SANITARIO', false),
      ),
    ).toBeDefined();
  });
});
