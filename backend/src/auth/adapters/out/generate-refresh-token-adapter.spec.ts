import { GenerateRefreshTokenAdapter } from './generate-refresh-token-adapter';

describe('GenerateRefreshTokenAdapter', () => {  
  const mockToken = "test"

  const mockJwtRefreshTokenGenerator = {
    generateRefreshToken: jest.fn().mockReturnValue("test"),
  };

  it('should be defined', () => {
    expect(new GenerateRefreshTokenAdapter(mockJwtRefreshTokenGenerator)).toBeDefined();
  });
});
