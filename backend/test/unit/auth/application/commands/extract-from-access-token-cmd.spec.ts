import { ExtractFromAccessTokenCmd } from 'src/auth/application/commands/extract-from-access-token-cmd';

describe('ExtractFromAccessTokenCmd', () => {
  it('should be defined', () => {
    expect(new ExtractFromAccessTokenCmd('')).toBeDefined();
  });
});
