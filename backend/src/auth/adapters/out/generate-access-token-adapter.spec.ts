import { GenerateAccessTokenAdapter } from "./generate-access-token-adapter";

describe('GenerateTokenAdapter', () => {
  const mockToken = "test"

  const mockJwtAccessTokenGenerator = {
    generateAccessToken: jest.fn().mockReturnValue("test"),
  };

  it('should be defined', () => {
    expect(new GenerateAccessTokenAdapter(mockJwtAccessTokenGenerator)).toBeDefined();
  });
});
