import { Payload } from 'src/auth/domain/payload';
import { GenerateAccessTokenCmd } from 'src/auth/application/commands/generate-access-token-cmd';

describe('GenerateTokenCmd', () => {
  it('should be defined', () => {
    expect(
      new GenerateAccessTokenCmd(
        new Payload(1, 'user', 'OPERATORE_SANITARIO', false),
      ),
    ).toBeDefined();
  });
});
