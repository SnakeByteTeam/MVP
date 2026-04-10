import { ExtractFromRefreshTokenCmd } from 'src/auth/application/commands/extract-from-refresh-token-cmd';

describe('ExtractFromRefreshTokenCmd', () => {
  it('should be defined', () => {
    expect(new ExtractFromRefreshTokenCmd('')).toBeDefined();
  });
});
