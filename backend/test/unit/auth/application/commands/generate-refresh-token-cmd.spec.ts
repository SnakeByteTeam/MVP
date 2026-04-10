import { Payload } from 'src/auth/domain/payload';
import { GenerateRefreshTokenCmd } from 'src/auth/application/commands/generate-refresh-token-cmd';

describe('GenerateRefreshTokenCmd', () => {
  it('should be defined', () => {
    expect(
      new GenerateRefreshTokenCmd(
        new Payload(1, 'user', 'OPERATORE_SANITARIO', false),
      ),
    ).toBeDefined();
  });
});
