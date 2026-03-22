import { JwtTokenGenerator } from './jwt-token-generator';

describe('JwtTokenGenerator', () => {
  it('should be defined', () => {
    expect(new JwtTokenGenerator()).toBeDefined();
  });
});
