import { RefreshCmd } from 'src/auth/application/commands/refresh-cmd';

describe('RefreshCmd', () => {
  it('should be defined', () => {
    expect(new RefreshCmd('')).toBeDefined();
  });
});
