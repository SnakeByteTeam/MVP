import { Tokens } from 'src/auth/domain/tokens';

describe('Tokens', () => {
  it('should be defined', () => {
    expect(new Tokens('', '')).toBeDefined();
  });
});
