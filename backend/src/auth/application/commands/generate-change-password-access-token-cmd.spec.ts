import { Payload } from '../../domain/payload';
import { GenerateChangePasswordAccessTokenCmd } from './generate-change-password-access-token-cmd';

describe('GenerateChangePasswordAccessTokenCmd', () => {
  it('should be defined', () => {
    expect(
      new GenerateChangePasswordAccessTokenCmd(
        new Payload(1, 'user', 'OPERATORE_SANITARIO', false),
      ),
    ).toBeDefined();
  });
});
